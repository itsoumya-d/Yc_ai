import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

const BATES_FONT_SIZE = 10;
const CONFIDENTIALITY_FONT_SIZE = 24;
const WATERMARK_OPACITY = 0.15;

/**
 * Stamp a Bates number on every page of a PDF.
 * Position: bottom-right by default.
 */
export async function stampBatesNumber(
  pdfBytes: Uint8Array,
  batesNumber: string,
  position: 'bottom-right' | 'bottom-left' | 'bottom-center' = 'bottom-right'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height: _height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(batesNumber, BATES_FONT_SIZE);

    let x: number;
    const y = 20;

    switch (position) {
      case 'bottom-left':
        x = 30;
        break;
      case 'bottom-center':
        x = (width - textWidth) / 2;
        break;
      case 'bottom-right':
      default:
        x = width - textWidth - 30;
        break;
    }

    page.drawText(batesNumber, {
      x,
      y,
      size: BATES_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}

/**
 * Add a diagonal confidentiality watermark across every page.
 */
export async function stampConfidentiality(
  pdfBytes: Uint8Array,
  level: 'confidential' | 'attorneys_eyes_only' | 'highly_confidential'
): Promise<Uint8Array> {
  const labels: Record<string, string> = {
    confidential: 'CONFIDENTIAL',
    attorneys_eyes_only: "ATTORNEYS' EYES ONLY",
    highly_confidential: 'HIGHLY CONFIDENTIAL',
  };

  const label = labels[level];
  if (!label) return pdfBytes;

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, CONFIDENTIALITY_FONT_SIZE);

    page.drawText(label, {
      x: (width - textWidth * 0.7) / 2,
      y: height / 2,
      size: CONFIDENTIALITY_FONT_SIZE,
      font,
      color: rgb(0.8, 0, 0),
      opacity: WATERMARK_OPACITY,
      rotate: degrees(45),
    });
  }

  return pdfDoc.save();
}

/**
 * Merge multiple PDF buffers into a single PDF document.
 */
export async function mergePdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    try {
      const srcDoc = await PDFDocument.load(buffer);
      const indices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
      for (const page of copiedPages) {
        mergedDoc.addPage(page);
      }
    } catch {
      // Skip corrupt PDFs — log will be in the export record
      continue;
    }
  }

  return mergedDoc.save();
}

/**
 * Render HTML content to a single-page PDF.
 * Uses pdf-lib to create a text-based PDF from structured data.
 */
export async function htmlToPdf(
  title: string,
  sections: { heading?: string; body: string; indent?: boolean }[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const PAGE_WIDTH = 612; // US Letter
  const PAGE_HEIGHT = 792;
  const MARGIN = 50;
  const LINE_HEIGHT = 16;
  const HEADING_SIZE = 14;
  const BODY_SIZE = 10;
  const MAX_LINE_WIDTH = PAGE_WIDTH - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let yPos = PAGE_HEIGHT - MARGIN;

  function ensureSpace(needed: number) {
    if (yPos - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      yPos = PAGE_HEIGHT - MARGIN;
    }
  }

  function wrapText(text: string, maxWidth: number, fontSize: number, f = font): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = f.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [''];
  }

  // Title
  ensureSpace(30);
  page.drawText(title, {
    x: MARGIN,
    y: yPos,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPos -= 30;

  // Horizontal rule
  page.drawLine({
    start: { x: MARGIN, y: yPos },
    end: { x: PAGE_WIDTH - MARGIN, y: yPos },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  yPos -= 20;

  for (const section of sections) {
    if (section.heading) {
      ensureSpace(HEADING_SIZE + LINE_HEIGHT + 10);
      yPos -= 8;
      page.drawText(section.heading, {
        x: MARGIN,
        y: yPos,
        size: HEADING_SIZE,
        font: boldFont,
        color: rgb(0.15, 0.15, 0.15),
      });
      yPos -= HEADING_SIZE + 6;
    }

    const bodyLines = section.body.split('\n');
    for (const line of bodyLines) {
      const xOffset = section.indent ? MARGIN + 20 : MARGIN;
      const availWidth = section.indent ? MAX_LINE_WIDTH - 20 : MAX_LINE_WIDTH;
      const isMonospace = line.startsWith('  ') || line.includes('|');
      const useFont = isMonospace ? monoFont : font;

      const wrapped = wrapText(line, availWidth, BODY_SIZE, useFont);
      for (const wrappedLine of wrapped) {
        ensureSpace(LINE_HEIGHT);
        page.drawText(wrappedLine, {
          x: xOffset,
          y: yPos,
          size: BODY_SIZE,
          font: useFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= LINE_HEIGHT;
      }
    }
  }

  return pdfDoc.save();
}

/**
 * Create a blank single-page PDF from raw text (for non-PDF documents).
 */
export async function textToPdf(text: string, title?: string): Promise<Uint8Array> {
  return htmlToPdf(title || 'Document', [{ body: text }]);
}

/**
 * Get the page count of a PDF buffer.
 */
export async function getPdfPageCount(pdfBytes: Uint8Array): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch {
    return 1;
  }
}
