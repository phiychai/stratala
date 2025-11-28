/**
 * Composable-related types
 * Extracted from composable files for better organization
 */

// useVisualEditing
export interface ApplyOptions {
  payloadUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements?: any;
  onSaved?: (data: {
    collection?: string;
    item?: PrimaryKey | null;
    payload?: Record<string, unknown>;
  }) => void;
  customClass?: string;
}

// useTableOfContents
export interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}
