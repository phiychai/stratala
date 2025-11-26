import { getPayload } from 'payload';
import type { Payload } from 'payload';
import type User from '#models/user';

import logger from '@adonisjs/core/services/logger';

// Payload config will be imported dynamically to handle monorepo path resolution
// The config path is relative to the backend app: ../../../cms/payload/src/payload.config

/**
 * Payload Service
 *
 * Handles communication with Payload CMS using Local API.
 * Local API provides direct database access without HTTP overhead.
 *
 * Multi-tenant support:
 * - Automatically filters queries by user ownership (createdBy field)
 * - Admins can access all content
 * - Passes user context to Payload for access control
 */
class PayloadService {
  private payload: Payload | null = null;
  private initializationPromise: Promise<Payload> | null = null;

  /**
   * Initialize Payload Local API
   * Uses singleton pattern to ensure Payload is only initialized once
   */
  async initialize(): Promise<Payload> {
    if (this.payload) {
      return this.payload;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // Dynamic import of Payload config from monorepo path
        // Using file:// protocol for absolute path resolution
        const configModule = await import('../../../cms/payload/src/payload.config.js');
        const config = configModule.default;

        this.payload = await getPayload({ config });
        logger.info('Payload Local API initialized successfully');
        return this.payload;
      } catch (error) {
        logger.error('Failed to initialize Payload Local API:', error);
        logger.error('Make sure Payload CMS is set up and the config path is correct');
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Get Payload instance (initializes if needed)
   */
  async getPayload(): Promise<Payload> {
    return this.initialize();
  }

  /**
   * Get items from a collection
   *
   * @param collection - Collection slug (e.g., 'posts', 'pages', 'spaces')
   * @param options - Query options including user context for multi-tenant filtering
   */
  async getItems<T = any>(
    collection: string,
    options: {
      user?: User;
      where?: Record<string, any>;
      limit?: number;
      page?: number;
      sort?: string;
      depth?: number;
    } = {}
  ): Promise<{ docs: T[]; totalDocs: number; limit: number; totalPages: number; page?: number }> {
    const payload = await this.getPayload();

    // Build where clause with tenant isolation
    const where: Record<string, any> = {
      ...options.where,
    };

    // Apply tenant isolation for non-admin users
    if (options.user && options.user.role !== 'admin') {
      // For collections that use createdBy field
      const collectionsWithCreatedBy = ['posts', 'pages', 'spaces'];
      if (collectionsWithCreatedBy.includes(collection)) {
        // Get Payload user ID from Adonis user
        const payloadUserId = options.user.payloadUserId;
        if (payloadUserId) {
          where.createdBy = {
            equals: payloadUserId,
          };
        }
      }
    }

    // Build sort
    let sort: string | undefined;
    if (options.sort) {
      sort = options.sort;
    }

    try {
      const result = await payload.find({
        collection,
        where,
        limit: options.limit || 10,
        page: options.page || 1,
        sort,
        depth: options.depth || 0,
        // Pass user context for access control
        user: options.user ? {
          id: options.user.payloadUserId || '',
          email: options.user.email,
          role: options.user.role,
        } : undefined,
      });

      return result;
    } catch (error) {
      logger.error(`Failed to get items from collection "${collection}":`, error);
      throw error;
    }
  }

  /**
   * Get a single item from a collection
   */
  async getItem<T = any>(
    collection: string,
    id: string,
    options: {
      user?: User;
      depth?: number;
    } = {}
  ): Promise<T> {
    const payload = await this.getPayload();

    try {
      const result = await payload.findByID({
        collection,
        id,
        depth: options.depth || 0,
        user: options.user ? {
          id: options.user.payloadUserId || '',
          email: options.user.email,
          role: options.user.role,
        } : undefined,
      });

      return result as T;
    } catch (error) {
      logger.error(`Failed to get item "${id}" from collection "${collection}":`, error);
      throw error;
    }
  }

  /**
   * Create an item in a collection
   */
  async createItem<T = any>(
    collection: string,
    data: Record<string, any>,
    options: {
      user?: User;
    } = {}
  ): Promise<T> {
    const payload = await this.getPayload();

    // Automatically set createdBy for tenant isolation
    if (options.user && options.user.payloadUserId) {
      const collectionsWithCreatedBy = ['posts', 'pages', 'spaces'];
      if (collectionsWithCreatedBy.includes(collection) && !data.createdBy) {
        data.createdBy = options.user.payloadUserId;
      }
    }

    try {
      const result = await payload.create({
        collection,
        data,
        user: options.user ? {
          id: options.user.payloadUserId || '',
          email: options.user.email,
          role: options.user.role,
        } : undefined,
      });

      return result as T;
    } catch (error) {
      logger.error(`Failed to create item in collection "${collection}":`, error);
      throw error;
    }
  }

  /**
   * Update an item in a collection
   */
  async updateItem<T = any>(
    collection: string,
    id: string,
    data: Record<string, any>,
    options: {
      user?: User;
      depth?: number;
    } = {}
  ): Promise<T> {
    const payload = await this.getPayload();

    try {
      const result = await payload.update({
        collection,
        id,
        data,
        depth: options.depth || 0,
        user: options.user ? {
          id: options.user.payloadUserId || '',
          email: options.user.email,
          role: options.user.role,
        } : undefined,
      });

      return result as T;
    } catch (error) {
      logger.error(`Failed to update item "${id}" in collection "${collection}":`, error);
      throw error;
    }
  }

  /**
   * Delete an item from a collection
   */
  async deleteItem(
    collection: string,
    id: string,
    options: {
      user?: User;
    } = {}
  ): Promise<void> {
    const payload = await this.getPayload();

    try {
      await payload.delete({
        collection,
        id,
        user: options.user ? {
          id: options.user.payloadUserId || '',
          email: options.user.email,
          role: options.user.role,
        } : undefined,
      });
    } catch (error) {
      logger.error(`Failed to delete item "${id}" from collection "${collection}":`, error);
      throw error;
    }
  }
}

// Singleton instance
export default new PayloadService();

