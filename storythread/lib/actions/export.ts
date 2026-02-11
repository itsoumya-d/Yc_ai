'use server';

import { createClient } from '@/lib/supabase/server';
import { getStory, ActionResult } from './stories';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import EPub from 'epub-gen-memory';
import puppeteer from 'puppeteer';

interface ExportSettings {
  font: string;
  fontSize: string;
  margins: string;
  chapterBreaks: string;
  includeTableOfContents: boolean;
  includeCoverPage: boolean;
}

interface ExportMetadata {
  authorName: string;
  copyright: string;
  isbn: string;
  publisher: string;
}

interface ExportOptions {
  format: 'epub' | 'pdf' | 'docx';
  settings: ExportSettings;
  metadata: ExportMetadata;
  coverFile: string | null;
  generateAICover: boolean;
}

export async function exportStory(
  storyId: string,
  options: ExportOptions
): Promise<ActionResult<{ url: string; filename: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get story with all chapters
    const result = await getStory(storyId);
    if (result.error || !result.data) {
      return { error: 'Story not found' };
    }

    const story = result.data;

    // Sort chapters by order
    const sortedChapters = [...story.chapters].sort((a, b) => a.order_index - b.order_index);

    let fileBuffer: Buffer;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'epub':
        ({ buffer: fileBuffer, filename } = await generateEPUB(story, sortedChapters, options));
        mimeType = 'application/epub+zip';
        break;
      case 'pdf':
        ({ buffer: fileBuffer, filename } = await generatePDF(story, sortedChapters, options));
        mimeType = 'application/pdf';
        break;
      case 'docx':
        // For now, we'll generate HTML that can be opened in Word
        ({ buffer: fileBuffer, filename } = await generateDOCX(story, sortedChapters, options));
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        return { error: 'Invalid export format' };
    }

    // Upload to Supabase Storage with 24-hour expiration
    const filepath = `exports/${user.id}/${storyId}-${Date.now()}.${options.format}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exports')
      .upload(filepath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '86400', // 24 hours
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: 'Failed to upload export file' };
    }

    // Get public URL with 24-hour expiration
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('exports')
      .createSignedUrl(filepath, 86400); // 24 hours

    if (urlError || !signedUrlData) {
      return { error: 'Failed to generate download link' };
    }

    return {
      data: {
        url: signedUrlData.signedUrl,
        filename,
      },
    };
  } catch (error: any) {
    console.error('Export error:', error);
    return { error: error.message || 'Failed to export story' };
  }
}

async function generateEPUB(story: any, chapters: any[], options: ExportOptions) {
  const { settings, metadata } = options;

  // Prepare cover image if provided
  let coverBuffer: Buffer | undefined;
  if (options.coverFile) {
    const base64Data = options.coverFile.split(',')[1];
    coverBuffer = Buffer.from(base64Data, 'base64');
  }

  // Prepare chapter content for EPUB
  const content = chapters.map((chapter) => ({
    title: chapter.title,
    content: `
      <h1 style="font-family: ${settings.font}, serif; margin-bottom: 2em;">${chapter.title}</h1>
      <div style="font-family: ${settings.font}, serif; font-size: ${settings.fontSize}pt; line-height: 1.8;">
        ${formatChapterContent(chapter.content)}
      </div>
    `,
  }));

  // Add table of contents if requested
  if (settings.includeTableOfContents) {
    content.unshift({
      title: 'Table of Contents',
      content: `
        <h1>Table of Contents</h1>
        <ul>
          ${chapters.map((ch, i) => `<li><a href="#chapter-${i + 1}">${ch.title}</a></li>`).join('')}
        </ul>
      `,
    });
  }

  // @ts-expect-error epub-gen-memory default export lacks construct signature
  const epub = new EPub(
    {
      title: story.title,
      author: metadata.authorName || 'Unknown Author',
      publisher: metadata.publisher || '',
      cover: coverBuffer as unknown as string | undefined,
      description: story.description || '',
      tocTitle: 'Table of Contents',
      prependChapterTitles: false,
      lang: 'en',
      css: `
        body {
          font-family: ${settings.font}, serif;
          font-size: ${settings.fontSize}pt;
          line-height: 1.8;
          margin: ${getMarginSize(settings.margins)};
        }
        h1 {
          page-break-before: ${settings.chapterBreaks === 'page' ? 'always' : 'auto'};
          margin-top: 2em;
          margin-bottom: 1em;
        }
        p {
          text-indent: 1.5em;
          margin: 0;
        }
        p:first-of-type {
          text-indent: 0;
        }
      `,
    },
    content
  );

  const buffer = await epub.genEpub();
  const filename = `${sanitizeFilename(story.title)}.epub`;

  return { buffer: Buffer.from(buffer), filename };
}

async function generatePDF(story: any, chapters: any[], options: ExportOptions) {
  const { settings, metadata } = options;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Build HTML content
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: ${getMarginSize(settings.margins)};
          }
          body {
            font-family: ${settings.font}, serif;
            font-size: ${settings.fontSize}pt;
            line-height: 1.8;
            color: #000;
          }
          h1 {
            page-break-before: ${settings.chapterBreaks === 'page' ? 'always' : 'auto'};
            margin-top: 2em;
            margin-bottom: 1em;
            font-size: 24pt;
          }
          p {
            text-indent: 1.5em;
            margin: 0.5em 0;
            text-align: justify;
          }
          p:first-of-type {
            text-indent: 0;
          }
          .cover-page {
            page-break-after: always;
            text-align: center;
            padding-top: 40%;
          }
          .cover-title {
            font-size: 36pt;
            font-weight: bold;
            margin-bottom: 0.5em;
          }
          .cover-author {
            font-size: 18pt;
            color: #666;
          }
          .toc {
            page-break-after: always;
          }
          .toc h2 {
            font-size: 24pt;
            margin-bottom: 1em;
          }
          .toc ul {
            list-style: none;
            padding: 0;
          }
          .toc li {
            margin: 0.5em 0;
          }
        </style>
      </head>
      <body>
    `;

    // Cover page
    if (settings.includeCoverPage) {
      html += `
        <div class="cover-page">
          <div class="cover-title">${story.title}</div>
          <div class="cover-author">by ${metadata.authorName || 'Unknown Author'}</div>
        </div>
      `;
    }

    // Table of contents
    if (settings.includeTableOfContents) {
      html += `
        <div class="toc">
          <h2>Table of Contents</h2>
          <ul>
            ${chapters.map((ch) => `<li>${ch.title}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Chapters
    for (const chapter of chapters) {
      html += `
        <div class="chapter">
          <h1>${chapter.title}</h1>
          ${formatChapterContent(chapter.content)}
        </div>
      `;
    }

    html += `
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    const filename = `${sanitizeFilename(story.title)}.pdf`;

    return { buffer: Buffer.from(pdfBuffer), filename };
  } finally {
    await browser.close();
  }
}

async function generateDOCX(story: any, chapters: any[], options: ExportOptions) {
  // For simplicity, generate an HTML file that can be opened in Word
  // For proper DOCX generation, consider using docx library
  const { settings, metadata } = options;

  let html = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: ${settings.font}, serif;
          font-size: ${settings.fontSize}pt;
          line-height: 1.8;
        }
        h1 {
          page-break-before: ${settings.chapterBreaks === 'page' ? 'always' : 'auto'};
        }
        p {
          text-indent: 1.5em;
          margin: 0.5em 0;
        }
      </style>
    </head>
    <body>
  `;

  if (settings.includeCoverPage) {
    html += `
      <div style="page-break-after: always; text-align: center; padding-top: 40%;">
        <h1 style="font-size: 36pt;">${story.title}</h1>
        <p style="font-size: 18pt;">by ${metadata.authorName || 'Unknown Author'}</p>
      </div>
    `;
  }

  for (const chapter of chapters) {
    html += `
      <h1>${chapter.title}</h1>
      ${formatChapterContent(chapter.content)}
    `;
  }

  html += '</body></html>';

  const filename = `${sanitizeFilename(story.title)}.docx`;

  return { buffer: Buffer.from(html), filename };
}

function formatChapterContent(content: string): string {
  // Convert chapter content to properly formatted paragraphs
  return content
    .split('\n\n')
    .filter((p) => p.trim())
    .map((p) => `<p>${p.trim()}</p>`)
    .join('');
}

function getMarginSize(margins: string): string {
  switch (margins) {
    case 'narrow':
      return '0.5in';
    case 'wide':
      return '1.5in';
    case 'normal':
    default:
      return '1in';
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}
