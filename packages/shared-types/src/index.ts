// Re-export Payload types
export type {
  Category,
  Form,
  FormField,
  Media,
  Navigation,
  Page,
  Post,
  Space,
  Tag,
  Tenant,
  Video,
} from './payload-types';

// Re-export Payload User type with alias
export type { User as PayloadUser } from './payload-types';

// Extract block types from Page interface
import type { Page } from './payload-types';

type PageBlocks = NonNullable<Page['blocks']>;
type PageBlockItem = PageBlocks[number];

export type PageBlock = PageBlockItem;

// Extract individual block types
export type BlockHero = Extract<PageBlockItem, { blockType: 'hero' }>;
export type BlockRichtext = Extract<PageBlockItem, { blockType: 'richtext' }>;
export type BlockGallery = Extract<PageBlockItem, { blockType: 'gallery' }>;
export type BlockPost = Extract<PageBlockItem, { blockType: 'posts' }>;
export type BlockPricing = Extract<PageBlockItem, { blockType: 'pricing' }>;
export type BlockForm = Extract<PageBlockItem, { blockType: 'form' }>;

// Re-export billing types
export type { Invoice, Plan, Subscription } from './billing';

// Re-export user types
export type { UserProfile } from './user';

// Re-export role types and constants
export {
  CONTENT_ROLES,
  isContentRole,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  USER_ROLES,
  UserRole,
  type UserRoleType,
} from './roles';

// Re-export preferences types
export type {
  AuthSyncErrorPayload,
  CommandPaletteSettings,
  UserPreferences,
  WidgetData,
} from './preferences';

// User-related types (for Better Auth/Adonis backend)
export interface AppUser {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// Content-related types
export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  category: string;
  tags: string[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Workspace-related types
export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Widget {
  id: string;
  type: 'note' | 'video' | 'article' | 'research' | 'todo';
  workspaceId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: import('./preferences').WidgetData;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
