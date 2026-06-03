import type { SeedContentSpec } from './types'

const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const paragraphNode = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'paragraph',
  version: 1,
})

const quoteNode = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'quote',
  version: 1,
})

const listItemNode = (text: string, value: number) => ({
  children: [paragraphNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'listitem',
  version: 1,
  value,
})

const listNode = (listType: 'bullet' | 'number', items: string[]) => ({
  children: items.map((item, index) => listItemNode(item, index + 1)),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType,
  start: 1,
  tag: listType === 'number' ? 'ol' : 'ul',
  type: 'list',
  version: 1,
})

const codeNode = (language: string, snippet: string) => ({
  children: [textNode(snippet)],
  direction: 'ltr',
  format: '',
  indent: 0,
  language,
  type: 'code',
  version: 1,
})

const uploadNode = (mediaId: number) => ({
  relationTo: 'media',
  type: 'upload',
  value: mediaId,
  version: 1,
})

export const buildLexicalContent = (
  spec: SeedContentSpec,
  inlineImageId: number | null,
): Record<string, unknown> => {
  const children: Record<string, unknown>[] = [paragraphNode(spec.intro)]

  for (const paragraph of spec.body) {
    children.push(paragraphNode(paragraph))
  }

  children.push(listNode(spec.listType, spec.listItems))

  const quoteText = spec.quote.by ? `"${spec.quote.text}" — ${spec.quote.by}` : `"${spec.quote.text}"`
  children.push(quoteNode(quoteText))

  if (spec.code) {
    children.push(codeNode(spec.code.language, spec.code.snippet))
  }

  if (inlineImageId) {
    children.push(uploadNode(inlineImageId))
  }

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}
