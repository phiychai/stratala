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
    children?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Check if content is Lexical format
 */
export function isLexicalContent(content: any): content is LexicalContent {
  if (!content || typeof content !== 'object') return false;
  return 'root' in content || (content.type === 'root' && Array.isArray(content.children));
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
  replacement: (content, node) => {
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
export function lexicalToHtml(content: LexicalContent | any | string | null | undefined): string {
  if (!content) return '';

  // If it's already a string, return as-is (might be markdown or plain HTML)
  if (typeof content === 'string') {
    return content;
  }

  try {
    // Step 1: Convert Lexical to HTML using Payload's official converter
    const html = convertLexicalToHTML({
      data: content,
    });

    // Step 2: Convert HTML to Markdown for use with Nuxt MDC
    const markdown = turndownService.turndown(html);
    return markdown;
  } catch (error) {
    console.warn('Failed to convert Lexical to Markdown:', error);
    return '';
  }
}
