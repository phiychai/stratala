import { ref, watch, type Ref } from 'vue';
import type { TocLink } from '~/types/composables';

type LexicalNode = {
  type?: string;
  tag?: string;
  depth?: number;
  text?: string;
  children?: LexicalNode[] | LexicalNode;
  root?: {
    children?: LexicalNode[];
  };
};

export function useTableOfContents(
  content:
    | Ref<string | LexicalNode | null | undefined>
    | (() => string | LexicalNode | null | undefined)
) {
  const tocLinks = ref<TocLink[]>([]);

  /**
   * Extract text from a Lexical node (recursively)
   */
  function extractTextFromLexicalNode(node: LexicalNode | string | null | undefined): string {
    if (!node) return '';

    if (typeof node === 'string') {
      return node;
    }

    if (node.text) {
      return node.text;
    }

    if (Array.isArray(node.children)) {
      return node.children.map((child) => extractTextFromLexicalNode(child)).join('');
    }

    if (node.children && !Array.isArray(node.children)) {
      return extractTextFromLexicalNode(node.children);
    }

    return '';
  }

  /**
   * Extract headings from Lexical format
   */
  function extractHeadingsFromLexical(
    content: LexicalNode | null | undefined,
    headings: TocLink[] = [],
    stack: TocLink[] = []
  ): TocLink[] {
    if (!content) return headings;

    // Handle Lexical root structure
    const root = content.root || content;
    const children = root.children || (Array.isArray(root) ? root : []);

    if (!Array.isArray(children)) return headings;

    for (const node of children) {
      if (!node || typeof node !== 'object') continue;

      // Check if this is a heading node
      // Lexical headings typically have type: 'heading' and tag: 'h1' | 'h2' | etc.
      const nodeType = node.type;
      const { tag } = node;

      if (nodeType === 'heading' || (tag && /^h[1-6]$/.test(tag))) {
        const depth = tag ? Number.parseInt(tag.replace('h', ''), 10) : node.depth || 1;
        const text = extractTextFromLexicalNode(node).trim();

        if (text) {
          const id = text
            .toLowerCase()
            .replace(/[^\da-z]+/g, '-')
            .replace(/^-+|-+$/g, '');

          const link: TocLink = { id, text, depth };

          // Build hierarchy
          while (stack.length > 0) {
            const lastItem = stack[stack.length - 1];
            if (lastItem && lastItem.depth >= depth) {
              stack.pop();
            } else {
              break;
            }
          }

          if (stack.length === 0) {
            headings.push(link);
            stack.push(link);
          } else {
            const parent = stack[stack.length - 1];
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(link);
              stack.push(link);
            }
          }
        }
      }

      // Recursively process children
      if (node.children && Array.isArray(node.children)) {
        extractHeadingsFromLexical(node, headings, stack);
      }
    }

    return headings;
  }

  /**
   * Convert markdown string to headings
   */
  function extractHeadingsFromMarkdown(content: string): TocLink[] {
    const lines = content.split('\n');
    const headings: TocLink[] = [];
    const stack: TocLink[] = [];

    for (const line of lines) {
      const trimmed = line.trimStart();
      const hashes = trimmed.match(/^#{1,6}/)?.[0];
      if (hashes && trimmed.length > hashes.length && trimmed[hashes.length] === ' ') {
        const depth = hashes.length;
        const text = trimmed.slice(depth).trim();
        const id = text
          .toLowerCase()
          .replace(/[^\da-z]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const link: TocLink = { id, text, depth };

        // Build hierarchy
        while (stack.length > 0) {
          const lastItem = stack[stack.length - 1];
          if (lastItem && lastItem.depth >= depth) {
            stack.pop();
          } else {
            break;
          }
        }

        if (stack.length === 0) {
          headings.push(link);
          stack.push(link);
        } else {
          const parent = stack[stack.length - 1];
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(link);
            stack.push(link);
          }
        }
      }
    }

    return headings;
  }

  function generateToc(content: string | LexicalNode): TocLink[] {
    if (!content) return [];

    // If it's a string, treat it as markdown
    if (typeof content === 'string') {
      return extractHeadingsFromMarkdown(content);
    }

    // If it's an object, try to extract from Lexical format
    if (typeof content === 'object' && content !== null) {
      return extractHeadingsFromLexical(content);
    }

    return [];
  }

  // Watch for content changes and regenerate TOC
  watch(
    typeof content === 'function' ? content : () => content.value,
    (contentValue) => {
      if (contentValue) {
        try {
          tocLinks.value = generateToc(contentValue);
        } catch (error) {
          console.warn('Failed to generate table of contents:', error);
          tocLinks.value = [];
        }
      } else {
        tocLinks.value = [];
      }
    },
    { immediate: true }
  );

  return {
    tocLinks,
    generateToc, // Expose for manual generation if needed
  };
}
