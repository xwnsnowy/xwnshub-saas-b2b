import { baseExtension } from '@/components/rich-text-editor/extension';
import { renderToMarkdown } from '@tiptap/static-renderer/pm/markdown';

function normalizeWhiteSpace(markdown: string) {
  return markdown
    .replace(/\s+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function tiptapJsonToMarkdown(json: string) {
  let content;

  try {
    content = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON format');
  }

  const markdown = renderToMarkdown({
    extensions: baseExtension,
    content: content,
  });

  return normalizeWhiteSpace(markdown);
}
