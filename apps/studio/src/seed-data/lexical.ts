const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

export const paragraphNode = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'paragraph',
  version: 1,
})

const listItemNode = (text: string, value: number) => ({
  children: [
    {
      children: [textNode(text)],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    },
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'listitem',
  version: 1,
  value,
})

export const bulletListNode = (...items: string[]) => ({
  children: items.map((item, index) => listItemNode(item, index + 1)),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType: 'bullet',
  type: 'list',
  version: 1,
  start: 1,
})

export const numberListNode = (...items: string[]) => ({
  children: items.map((item, index) => listItemNode(item, index + 1)),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType: 'number',
  type: 'list',
  version: 1,
  start: 1,
})

export const richTextFromNodes = (...children: Record<string, unknown>[]) => ({
  root: {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

export const richText = (...paragraphs: string[]) => ({
  root: {
    children: paragraphs.map(paragraphNode),
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})
