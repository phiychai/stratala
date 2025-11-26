/**
 * Payload CMS Type Definitions
 * Minimal type definitions compatible with Payload CMS structure
 * These types match the Payload API responses
 */

// Media/File types (Payload uses Media, alias as DirectusFile for compatibility)
export interface Media {
  id: number;
  alt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  updatedAt: string;
  createdAt: string;
}

// Alias for backward compatibility
export type DirectusFile = Media;

// User types (Payload uses User, alias as DirectusUser for compatibility)
export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: 'admin' | 'content_admin' | 'editor' | 'writer' | 'user';
  updatedAt: string;
  createdAt: string;
}

// Alias for backward compatibility
export type DirectusUser = User;

// Post types
export interface Post {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  content?: any; // Lexical editor content
  image?: number | Media | null;
  author: number | User;
  space?: number | Space | null;
  status: 'draft' | 'in_review' | 'published';
  publishedAt?: string | null;
  published_at?: string | null; // Alias for backward compatibility
  type: 'article' | 'audio' | 'video';
  categories?: (number | Category)[] | null;
  tags?: (number | Tag)[] | null;
  seo?: {
    title?: string | null;
    metaDescription?: string | null;
    meta_description?: string | null; // Alias for backward compatibility
    ogImage?: number | Media | null;
  };
  updatedAt: string;
  createdAt: string;
}

// Space types
export interface Space {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  owner: number | User;
  isDefault?: boolean | null;
  updatedAt: string;
  createdAt: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  updatedAt: string;
  createdAt: string;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
  updatedAt: string;
  createdAt: string;
}

// Page types
export interface Page {
  id: number;
  title: string;
  permalink: string;
  status: 'draft' | 'in_review' | 'published';
  publishedAt?: string | null;
  published_at?: string | null; // Alias for backward compatibility
  blocks?: PageBlock[] | null;
  seo?: {
    title?: string | null;
    metaDescription?: string | null;
    meta_description?: string | null; // Alias for backward compatibility
    ogImage?: number | Media | null;
  };
  updatedAt: string;
  createdAt: string;
}

// PageBlock types (extracted from Page blocks)
export type PageBlock =
  | BlockHero
  | BlockRichtext
  | BlockGallery
  | BlockPricing
  | BlockPost
  | BlockForm;

// Block type definitions
export interface BlockHero {
  id?: string | null;
  blockName?: string | null;
  blockType: 'hero';
  tagline?: string | null;
  headline?: string | null;
  description?: string | null;
  image?: number | Media | null;
  layout?: ('image_left' | 'image_center' | 'image_right') | null;
  buttons?: Array<{
    id?: string | null;
    label: string;
    type: 'page' | 'post' | 'url';
    page?: number | Page | null;
    post?: number | Post | null;
    url?: string | null;
    variant?: ('default' | 'outline' | 'soft' | 'ghost' | 'link') | null;
  }> | null;
}

export interface BlockRichtext {
  id?: string | null;
  blockName?: string | null;
  blockType: 'richtext';
  tagline?: string | null;
  headline?: string | null;
  content?: any; // Lexical editor content
  alignment?: ('left' | 'center') | null;
}

export interface BlockGallery {
  id?: string | null;
  blockName?: string | null;
  blockType: 'gallery';
  tagline?: string | null;
  headline?: string | null;
  items?: Array<{
    id?: string | null;
    image: number | Media;
    caption?: string | null;
  }> | null;
}

export interface BlockPricing {
  id?: string | null;
  blockName?: string | null;
  blockType: 'pricing';
  tagline?: string | null;
  headline?: string | null;
  pricingCards?: Array<{
    id?: string | null;
    title: string;
    description?: string | null;
    price?: string | null;
    badge?: string | null;
    features?: Array<{
      id?: string | null;
      feature?: string | null;
    }> | null;
    button: {
      label: string;
      type: 'page' | 'post' | 'url';
      page?: number | Page | null;
      post?: number | Post | null;
      url?: string | null;
    };
    isHighlighted?: boolean | null;
  }> | null;
}

export interface BlockPost {
  id?: string | null;
  blockName?: string | null;
  blockType: 'posts';
  tagline?: string | null;
  headline?: string | null;
  collection: 'posts';
  limit?: number | null;
}

export interface BlockForm {
  id?: string | null;
  blockName?: string | null;
  blockType: 'form';
  tagline?: string | null;
  headline?: string | null;
  form?: number | Form | null;
}

// Form types
export interface Form {
  id: number;
  title: string;
  isActive?: boolean | null;
  fields?: (number | FormField)[] | null;
  submitLabel?: string | null;
  onSuccess?: ('redirect' | 'message') | null;
  successMessage?: string | null;
  successRedirectUrl?: string | null;
  emails?: Array<{
    id?: string | null;
    to?: Array<{
      id?: string | null;
      email?: string | null;
    }> | null;
    subject?: string | null;
    message?: string | null;
  }> | null;
  updatedAt: string;
  createdAt: string;
}

export interface FormField {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'checkbox_group' | 'radio' | 'file' | 'select' | 'hidden';
  placeholder?: string | null;
  help?: string | null;
  validation?: string | null;
  required?: boolean | null;
  width?: ('100' | '67' | '50' | '33') | null;
  choices?: Array<{
    id?: string | null;
    text: string;
    value: string;
  }> | null;
  form?: number | Form | null;
  sort?: number | null;
  updatedAt: string;
  createdAt: string;
}

