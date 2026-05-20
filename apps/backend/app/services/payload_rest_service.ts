import logger from '@adonisjs/core/services/logger';
import env from '#start/env';

/**
 * Payload REST API Service
 *
 * Provides HTTP-based access to Payload CMS when Local API is not available.
 * This is a fallback for user sync operations when TypeScript import issues occur.
 */
class PayloadRestService {
  private baseUrl: string;
  private secret: string;

  constructor() {
    this.baseUrl = env.get('PAYLOAD_PUBLIC_SERVER_URL', 'http://localhost:3002');
    this.secret = env.get('PAYLOAD_SECRET', '');
  }

  /**
   * Create a user via REST API
   */
  async createUser(data: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    adonisUserId?: string;
  }): Promise<{ id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Payload REST API may require authentication for user creation
          // For now, we'll try without auth (may need to configure)
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payload REST API error: ${response.status} ${errorText}`);
      }

      const result = (await response.json()) as {
        id?: string;
        doc?: { id?: string };
        user?: { id?: string };
      };
      const createdId = result.id || result.doc?.id || result.user?.id;
      if (!createdId) {
        throw new Error('Payload REST API response did not include a user id');
      }
      return { id: createdId };
    } catch (error) {
      logger.error('Failed to create user via Payload REST API:', error);
      throw error;
    }
  }

  /**
   * Find user by email via REST API
   */
  async findUserByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/users?where[email][equals]=${encodeURIComponent(email)}&limit=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Payload REST API error: ${response.status} ${errorText}`);
      }

      const result = (await response.json()) as {
        docs?: Array<{ id?: string }>;
      };
      const foundId = result.docs?.[0]?.id;
      if (foundId) {
        return { id: foundId };
      }

      return null;
    } catch (error) {
      logger.error('Failed to find user via Payload REST API:', error);
      return null;
    }
  }

  /**
   * Update user via REST API
   */
  async updateUser(
    id: string,
    data: {
      email?: string;
      password?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      adonisUserId?: string;
    }
  ): Promise<{ id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payload REST API error: ${response.status} ${errorText}`);
      }

      const result = (await response.json()) as {
        id?: string;
        doc?: { id?: string };
        user?: { id?: string };
      };
      return { id: result.id || result.doc?.id || result.user?.id || id };
    } catch (error) {
      logger.error('Failed to update user via Payload REST API:', error);
      throw error;
    }
  }
}

export default new PayloadRestService();
