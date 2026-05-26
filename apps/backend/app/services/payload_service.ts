import { lookup } from 'node:dns/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

import logger from '@adonisjs/core/services/logger';
import { getPayload } from 'payload';

import type User from '#models/user';
import type { CollectionSlug, Payload, Where } from 'payload';

// Payload config will be imported dynamically to handle monorepo path resolution
// The config path is relative to the backend app: ../../studio/src/payload.config

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
   * If we're running outside Docker and the DB URI points to host "postgres",
   * rewrite it to localhost so Local API can connect in local CLI runs.
   */
  private async normalizePayloadDbHostForLocalRuntime(): Promise<void> {
    const uri = process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URI || '';

    if (!uri) {
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(uri);
    } catch {
      return;
    }

    if (parsed.hostname !== 'postgres') {
      return;
    }

    try {
      await lookup(parsed.hostname);
      return;
    } catch {
      // Host "postgres" is not resolvable in this runtime context.
    }

    parsed.hostname = 'localhost';
    const normalizedUri = parsed.toString();
    process.env.PAYLOAD_DATABASE_URI = normalizedUri;

    if (process.env.DATABASE_URI && process.env.DATABASE_URI.includes('@postgres')) {
      process.env.DATABASE_URI = normalizedUri;
    }

    logger.warn(
      'Adjusted Payload DB host from "postgres" to "localhost" for local runtime compatibility'
    );
  }

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
        await this.normalizePayloadDbHostForLocalRuntime();

        // Dynamic import of Payload config from monorepo path
        // Using absolute path with file:// protocol for proper resolution

        // Get the current file's directory
        const currentFile = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFile);

        // Resolve to workspace root, then to Payload config
        // From: apps/backend/app/services/payload_service.ts
        // To: apps/studio/src/payload.config.ts
        // Go up 4 levels: services -> app -> backend -> apps -> root
        const workspaceRoot = join(currentDir, '../../../..');
        const payloadConfigPath = join(workspaceRoot, 'apps/studio/src/payload.config.ts');

        const configUrl = pathToFileURL(payloadConfigPath).href;

        // Prefer jiti first because it works reliably when Ace has already
        // registered ts-node. Keep tsx/native import as fallbacks.
        let configModule;
        try {
          const { default: createJiti } = await import('jiti');
          const jiti = createJiti(import.meta.url, {
            interopDefault: true,
          });
          const jitiModule = await jiti(payloadConfigPath);
          configModule =
            jitiModule && typeof jitiModule === 'object' && 'default' in jitiModule
              ? jitiModule
              : { default: jitiModule };
        } catch (jitiError) {
          try {
            const { tsImport } = await import('tsx/esm/api');
            configModule = await tsImport(configUrl, import.meta.url);
          } catch (tsxError) {
            try {
              configModule = await import(configUrl);
            } catch (nativeError) {
              const jitiMessage =
                jitiError instanceof Error ? jitiError.message : String(jitiError);
              const tsxMessage = tsxError instanceof Error ? tsxError.message : String(tsxError);
              const nativeMessage =
                nativeError instanceof Error ? nativeError.message : String(nativeError);

              throw new Error(
                `Failed to load Payload config via jiti (${jitiMessage}), tsx (${tsxMessage}), and native import (${nativeMessage})`
              );
            }
          }
        }

        const config = configModule.default;

        this.payload = await getPayload({ config });
        logger.info('Payload Local API initialized successfully');
        return this.payload;
      } catch (error) {
        logger.error({ err: error }, 'Failed to initialize Payload Local API');
        logger.error('Make sure Payload CMS is set up and the config path is correct');

        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Payload Local API root cause: ${errorMessage}`);
        const likelyLoaderIssue =
          errorMessage.includes('Unknown file extension') ||
          errorMessage.includes('ERR_UNKNOWN_FILE_EXTENSION') ||
          errorMessage.includes('Cannot use import statement outside a module') ||
          (errorMessage.includes('Cannot find module') && errorMessage.includes('payload.config'));

        if (likelyLoaderIssue) {
          logger.error('Note: TypeScript config files require a loader such as tsx or ts-node');
        }

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
  async getItems<T = unknown>(
    collection: CollectionSlug,
    options: {
      user?: User;
      where?: Where;
      limit?: number;
      page?: number;
      sort?: string;
      depth?: number;
    } = {}
  ): Promise<{ docs: T[]; totalDocs: number; limit: number; totalPages: number; page?: number }> {
    const payload = await this.getPayload();

    // Build where clause with tenant isolation
    const where: Where = {
      ...options.where,
    };

    // Apply tenant isolation for non-admin users
    if (options.user && options.user.role !== 'admin') {
      // For collections that use createdBy field
      const collectionsWithCreatedBy = ['posts', 'pages'];
      if (collectionsWithCreatedBy.includes(collection)) {
        // Get Payload user ID from Adonis user
        const { payloadUserId } = options.user;
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
        user: options.user
          ? {
              id: options.user.payloadUserId || '',
              email: options.user.email,
              role: options.user.role,
            }
          : undefined,
      });

      return result as unknown as {
        docs: T[];
        totalDocs: number;
        limit: number;
        totalPages: number;
        page?: number;
      };
    } catch (error) {
      logger.error(`Failed to get items from collection "${collection}":`, error);
      throw error;
    }
  }

  /**
   * Get a single item from a collection
   */
  async getItem<T = unknown>(
    collection: CollectionSlug,
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
        user: options.user
          ? {
              id: options.user.payloadUserId || '',
              email: options.user.email,
              role: options.user.role,
            }
          : undefined,
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
  async createItem<T = unknown>(
    collection: CollectionSlug,
    data: Record<string, unknown>,
    options: {
      user?: User;
    } = {}
  ): Promise<T> {
    const payload = await this.getPayload();

    // Automatically set createdBy for tenant isolation
    if (options.user && options.user.payloadUserId) {
      const collectionsWithCreatedBy = ['posts', 'pages'];
      if (collectionsWithCreatedBy.includes(collection) && !data.createdBy) {
        data.createdBy = options.user.payloadUserId;
      }
    }

    try {
      const result = await payload.create({
        collection,
        data,
        user: options.user
          ? {
              id: options.user.payloadUserId || '',
              email: options.user.email,
              role: options.user.role,
            }
          : undefined,
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
  async updateItem<T = unknown>(
    collection: CollectionSlug,
    id: string,
    data: Record<string, unknown>,
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
        user: options.user
          ? {
              id: options.user.payloadUserId || '',
              email: options.user.email,
              role: options.user.role,
            }
          : undefined,
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
    collection: CollectionSlug,
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
        user: options.user
          ? {
              id: options.user.payloadUserId || '',
              email: options.user.email,
              role: options.user.role,
            }
          : undefined,
      });
    } catch (error) {
      logger.error(`Failed to delete item "${id}" from collection "${collection}":`, error);
      throw error;
    }
  }
}

// Singleton instance
export default new PayloadService();
