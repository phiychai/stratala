import { $fetch } from 'ofetch';

const {
  public: { payloadUrl },
} = useRuntimeConfig();

/**
 * Payload REST API Client
 *
 * Uses native fetch to communicate with Payload CMS REST API.
 * Payload REST API documentation: https://payloadcms.com/docs/rest-api/overview
 */

const payloadBaseUrl = (payloadUrl as string) || 'http://localhost:3002';

/**
 * Payload REST API helper functions
 */

/**
 * Get items from a collection
 */
export async function getItems<T = unknown>(
  collection: string,
  options: {
    where?: Record<string, unknown>;
    limit?: number;
    page?: number;
    sort?: string;
    depth?: number;
    locale?: string;
    draft?: boolean;
    trash?: boolean;
  } = {}
): Promise<{ docs: T[]; totalDocs: number; limit: number; totalPages: number; page?: number }> {
  const queryParams = new URLSearchParams();

  if (options.where) {
    queryParams.append('where', JSON.stringify(options.where));
  }
  if (options.limit) {
    queryParams.append('limit', options.limit.toString());
  }
  if (options.page) {
    queryParams.append('page', options.page.toString());
  }
  if (options.sort) {
    queryParams.append('sort', options.sort);
  }
  if (options.depth) {
    queryParams.append('depth', options.depth.toString());
  }
  if (options.locale) {
    queryParams.append('locale', options.locale);
  }
  // Add draft and trash parameters (Payload admin uses these)
  if (options.draft !== undefined) {
    queryParams.append('draft', options.draft.toString());
  } else {
    queryParams.append('draft', 'false'); // Default to false for published content
  }
  if (options.trash !== undefined) {
    queryParams.append('trash', options.trash.toString());
  } else {
    queryParams.append('trash', 'false'); // Default to false (exclude trashed items)
  }

  const url = `${payloadBaseUrl}/api/${collection}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return await $fetch(url);
}

/**
 * Get a single item by ID
 */
export async function getItem<T = unknown>(
  collection: string,
  id: string,
  options: {
    depth?: number;
    locale?: string;
  } = {}
): Promise<T> {
  const queryParams = new URLSearchParams();

  if (options.depth) {
    queryParams.append('depth', options.depth.toString());
  }
  if (options.locale) {
    queryParams.append('locale', options.locale);
  }

  const url = `${payloadBaseUrl}/api/${collection}/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return await $fetch(url);
}

/**
 * Get global data
 */
export async function getGlobal<T = unknown>(
  global: string,
  options: {
    depth?: number;
    locale?: string;
  } = {}
): Promise<T> {
  const queryParams = new URLSearchParams();

  if (options.depth) {
    queryParams.append('depth', options.depth.toString());
  }
  if (options.locale) {
    queryParams.append('locale', options.locale);
  }

  const url = `${payloadBaseUrl}/api/globals/${global}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return await $fetch(url);
}

/**
 * Create an item
 */
export async function createItem<T = unknown>(
  collection: string,
  data: Record<string, unknown>,
  options: {
    depth?: number;
    locale?: string;
  } = {}
): Promise<T> {
  const queryParams = new URLSearchParams();

  if (options.depth) {
    queryParams.append('depth', options.depth.toString());
  }
  if (options.locale) {
    queryParams.append('locale', options.locale);
  }

  const url = `${payloadBaseUrl}/api/${collection}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return await $fetch(url, {
    method: 'POST',
    body: data,
  });
}

/**
 * Update an item
 */
export async function updateItem<T = unknown>(
  collection: string,
  id: string,
  data: Record<string, unknown>,
  options: {
    depth?: number;
    locale?: string;
  } = {}
): Promise<T> {
  const queryParams = new URLSearchParams();

  if (options.depth) {
    queryParams.append('depth', options.depth.toString());
  }
  if (options.locale) {
    queryParams.append('locale', options.locale);
  }

  const url = `${payloadBaseUrl}/api/${collection}/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return await $fetch(url, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Delete an item
 */
export async function deleteItem(collection: string, id: string): Promise<void> {
  const url = `${payloadBaseUrl}/api/${collection}/${id}`;

  return await $fetch(url, {
    method: 'DELETE',
  });
}

/**
 * Payload query filter type (for TypeScript)
 */
export type PayloadWhere = Record<string, unknown>;

/**
 * Payload server instance (for compatibility with existing code)
 */
export const payloadServer = {
  getItems,
  getItem,
  getGlobal,
  createItem,
  updateItem,
  deleteItem,
};
