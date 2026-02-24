/**
 * Lightweight Markdown renderer for story content preview.
 * Handles the subset of Markdown used in writing apps.
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Process blocks split by double newlines
  const blocks = html.split(/\n\n+/);
  const rendered = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // Headings
    if (trimmed.startsWith('### '))
      return `<h3>${applyInline(trimmed.slice(4))}</h3>`;
    if (trimmed.startsWith('## '))
      return `<h2>${applyInline(trimmed.slice(3))}</h2>`;
    if (trimmed.startsWith('# '))
      return `<h1>${applyInline(trimmed.slice(2))}</h1>`;

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const inner = trimmed
        .split('\n')
        .map((l) => applyInline(l.replace(/^>\s?/, '')))
        .join('\n');
      return `<blockquote>${inner}</blockquote>`;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      return '<hr>';
    }

    // Regular paragraph (preserve single newlines as <br>)
    const paragraph = trimmed
      .split('\n')
      .map(applyInline)
      .join('<br>');
    return `<p>${paragraph}</p>`;
  });

  return rendered.filter(Boolean).join('\n');
}

function applyInline(text: string): string {
  return text
    // Bold + italic: ***text***
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>');
}
