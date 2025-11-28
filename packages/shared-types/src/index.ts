// Re-export Payload types
export type {
  Post,
  Page,
  PageBlock,
  Space,
  Media,
  DirectusFile,
  User,
  DirectusUser,
  Category,
  Tag,
  Form,
  FormField,
  BlockHero,
  BlockRichtext,
  BlockGallery,
  BlockPricing,
  BlockPost,
  BlockForm,
} from './payload-types';

// Re-export billing types
export type { Invoice, Plan, Subscription } from './billing';

// Re-export user types
export type { UserProfile } from './user';

// Re-export role types and constants
export {
  UserRole,
  USER_ROLES,
  CONTENT_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  isContentRole,
  type UserRoleType,
} from './roles';

// Re-export preferences types
export type {
  AuthSyncErrorPayload,
  CommandPaletteSettings,
  UserPreferences,
  WidgetData,
} from './preferences';

// User-related types
export interface User {
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
