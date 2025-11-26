import type { HttpContext } from '@adonisjs/core/http';

import payloadService from '#services/payload_service';

export default class CmsProxyController {
  /**
   * @get
   * @summary Proxy GET request to CMS
   * @description Retrieves items from Payload CMS using Local API. Supports query parameters for filtering, sorting, and pagination. Returns the response from Payload.
   * @tag CMS Proxy
   * @paramPath {string} * - Path to Payload collection/item (e.g., "posts", "posts/123")
   * @paramQuery {string} fields - Comma-separated list of fields to return (e.g., "id,title,content")
   * @paramQuery {object} where - Payload where filter object (e.g., {"status": {"equals": "published"}})
   * @paramQuery {string} sort - Sort field(s) (e.g., "-createdAt" for descending)
   * @paramQuery {integer} limit - Maximum number of items to return
   * @paramQuery {integer} page - Page number
   * @paramQuery {integer} depth - Depth for relations
   * @response 200 - Content retrieved successfully from CMS
   * @response 500 - Server error - Failed to fetch from CMS
   */
  async get({ params, request, response, auth }: HttpContext) {
    try {
      const path = params['*'].join('/');
      const pathParts = path.split('/');
      const collection = pathParts[0];
      const id = pathParts[1];

      // Get current user for multi-tenant filtering
      const user = auth.user || undefined;

      if (id) {
        // Get single item
        const item = await payloadService.getItem(collection, id, {
          user,
          depth: request.input('depth', 0),
        });

        return response.ok({
          collection,
          data: item,
        });
      } else {
        // Get items
        const queryParams = request.qs();
        const where = queryParams.where ? JSON.parse(queryParams.where as string) : undefined;

        const result = await payloadService.getItems(collection, {
          user,
          where,
          limit: request.input('limit', 10),
          page: request.input('page', 1),
          sort: request.input('sort'),
          depth: request.input('depth', 0),
        });

        return response.ok({
          collection,
          data: result.docs,
          pagination: {
            totalDocs: result.totalDocs,
            limit: result.limit,
            totalPages: result.totalPages,
            page: result.page,
          },
        });
      }
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch from CMS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * @post
   * @summary Create item in CMS
   * @description Creates a new item in Payload CMS using Local API. Requires authentication. The request body is forwarded to Payload.
   * @tag CMS Proxy
   * @paramPath {string} * - Path to Payload collection (e.g., "posts")
   * @requestBody {object} body - Data to create in CMS (structure depends on collection, all collection fields are accepted)
   * @paramQuery {integer} depth - Depth for relations
   * @response 200 - Content created successfully in CMS
   * @response 401 - Unauthorized - Authentication required
   * @response 400 - Bad request - Invalid data or missing required fields
   * @response 500 - Server error - Failed to create content in CMS
   */
  async post({ params, request, response, auth }: HttpContext) {
    try {
      // Only authenticated users can create content
      await auth.check();

      const path = params['*'].join('/');
      const collection = path.split('/')[0];
      const body = request.body();

      const item = await payloadService.createItem(collection, body, {
        user: auth.user!,
      });

      return response.ok({
        collection,
        data: item,
      });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to create content in CMS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * @patch
   * @summary Update item in CMS
   * @description Updates an item in Payload CMS using Local API. Requires authentication. Supports partial updates.
   * @tag CMS Proxy
   * @paramPath {string} * - Path to Payload collection/item (e.g., "posts/123")
   * @requestBody {object} body - Data to update in CMS (structure depends on collection, only provided fields will be updated)
   * @paramQuery {integer} depth - Depth for relations
   * @response 200 - Content updated successfully in CMS
   * @response 401 - Unauthorized - Authentication required
   * @response 404 - Item not found
   * @response 500 - Server error - Failed to update content in CMS
   */
  async patch({ params, request, response, auth }: HttpContext) {
    try {
      // Only authenticated users can update content
      await auth.check();

      const path = params['*'].join('/');
      const pathParts = path.split('/');
      const collection = pathParts[0];
      const id = pathParts[1];

      if (!id) {
        return response.badRequest({
          message: 'Item ID is required',
        });
      }

      const body = request.body();

      const item = await payloadService.updateItem(collection, id, body, {
        user: auth.user!,
        depth: request.input('depth', 0),
      });

      return response.ok({
        collection,
        data: item,
      });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to update content in CMS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * @delete
   * @summary Delete item from CMS
   * @description Deletes an item from Payload CMS using Local API. Requires admin authentication. Only admins can delete content.
   * @tag CMS Proxy
   * @paramPath {string} * - Path to Payload collection/item (e.g., "posts/123")
   * @response 200 - Content deleted successfully from CMS
   * @response 401 - Unauthorized - Authentication required
   * @response 403 - Forbidden - Admin access required
   * @response 500 - Server error - Failed to delete content from CMS
   */
  async delete({ params, response, auth }: HttpContext) {
    try {
      // Only authenticated users can delete content
      await auth.check();
      const user = auth.user!;

      // Only admins can delete content
      if (user.role !== 'admin') {
        return response.forbidden({
          message: 'Only admins can delete content',
        });
      }

      const path = params['*'].join('/');
      const pathParts = path.split('/');
      const collection = pathParts[0];
      const id = pathParts[1];

      if (!id) {
        return response.badRequest({
          message: 'Item ID is required',
        });
      }

      await payloadService.deleteItem(collection, id, {
        user,
      });

      return response.ok({
        message: 'Item deleted successfully',
      });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to delete content from CMS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * @getCollection
   * @summary Get collection items
   * @description Retrieves all items from a specific Payload collection. Supports Payload query parameters for filtering, sorting, and pagination.
   * @tag CMS Proxy
   * @paramPath {string} collection - Collection name (e.g., "posts", "categories")
   * @paramQuery {object} where - Payload where filter object (e.g., {"status": {"equals": "published"}})
   * @paramQuery {string} sort - Sort field(s) (e.g., "-createdAt" for descending)
   * @paramQuery {integer} limit - Maximum number of items to return
   * @paramQuery {integer} page - Page number
   * @paramQuery {integer} depth - Depth for relations
   * @response 200 - Collection items retrieved successfully
   * @response 500 - Server error - Failed to fetch collection from CMS
   */
  async getCollection({ params, request, response, auth }: HttpContext) {
    try {
      const { collection } = params;
      const queryParams = request.qs();
      const where = queryParams.where ? JSON.parse(queryParams.where as string) : undefined;

      const result = await payloadService.getItems(collection, {
        user: auth.user || undefined,
        where,
        limit: request.input('limit', 10),
        page: request.input('page', 1),
        sort: request.input('sort'),
        depth: request.input('depth', 0),
      });

      return response.ok({
        collection,
        data: result.docs,
        pagination: {
          totalDocs: result.totalDocs,
          limit: result.limit,
          totalPages: result.totalPages,
          page: result.page,
        },
      });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch collection from CMS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * @getItem
   * @summary Get single collection item
   * @description Retrieves a single item from a Payload collection by ID. Supports Payload query parameters for field selection and relations.
   * @tag CMS Proxy
   * @paramPath {string} collection - Collection name (e.g., "posts", "categories")
   * @paramPath {string} id - Item ID (UUID)
   * @paramQuery {integer} depth - Depth for relations
   * @response 200 - Item retrieved successfully
   * @response 404 - Item not found
   * @response 500 - Server error - Failed to fetch item from CMS
   */
  async getItem({ params, request, response, auth }: HttpContext) {
    try {
      const { collection } = params;
      const { id } = params;

      const item = await payloadService.getItem(collection, id, {
        user: auth.user || undefined,
        depth: request.input('depth', 0),
      });

      return response.ok({
        collection,
        data: item,
      });
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch item from CMS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
