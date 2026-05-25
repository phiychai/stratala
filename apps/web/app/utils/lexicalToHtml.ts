/**
 * Convert Lexical JSON to Markdown
 * Handles Payload CMS richText fields that use Lexical editor
 * Converts Lexical -> HTML -> Markdown for use with Nuxt MDC
 *
 * Note: Function is named lexicalToHtml for backward compatibility,
 * but it now returns Markdown instead of HTML
 */

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';
import TurndownService from 'turndown';

export interface LexicalContent {
  root?: {
    type?: string;
    children?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Check if content is Lexical format
 */
export function isLexicalContent(content: unknown): content is LexicalContent {
  if (!content || typeof content !== 'object') return false;
  const record = content as { root?: unknown; type?: unknown; children?: unknown };
  return 'root' in record || (record.type === 'root' && Array.isArray(record.children));
}

// Initialize Turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  codeBlockStyle: 'fenced', // Use ``` for code blocks
  bulletListMarker: '-', // Use - for unordered lists
  emDelimiter: '*', // Use * for emphasis
  strongDelimiter: '**', // Use ** for strong
});

// Configure Turndown to handle images properly
turndownService.addRule('image', {
  filter: 'img',
  replacement: (_content: string, node: Node) => {
    const img = node as HTMLImageElement;
    const alt = img.alt || '';
    const src = img.src || '';
    const title = img.title ? ` "${img.title}"` : '';
    return `![${alt}](${src}${title})`;
  },
});

/**
 * Convert Lexical content to Markdown string
 * Uses Payload's HTML converter, then converts HTML to Markdown for Nuxt MDC
 */
export function lexicalToHtml(content: LexicalContent | string | null | undefined): string {
  if (!content) return '';

  // If it's already a string, return as-is (might be markdown or plain HTML)
  if (typeof content === 'string') {
    return content;
  }

  try {
    // Step 1: Convert Lexical to HTML using Payload's official converter
    const html = convertLexicalToHTML({
      data: content as unknown as Parameters<typeof convertLexicalToHTML>[0]['data'],
    });

    // Step 2: Convert HTML to Markdown for use with Nuxt MDC
    const markdown = turndownService.turndown(html);
    return markdown;
  } catch (error) {
    console.warn('Failed to convert Lexical to Markdown:', error);
    return '';
  }
}
