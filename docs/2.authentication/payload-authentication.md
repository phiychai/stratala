---
title: 'Payload CMS Authentication Strategy'
description:
  'Authentication strategy for Payload CMS in multi-tenant architecture with
  Better Auth and AdonisJS integration'
navigation:
  title: 'Payload Authentication'
  order: 4
---

## Overview

This document outlines the authentication strategy for Payload CMS in our
multi-tenant architecture. Payload integrates with our existing Better Auth +
AdonisJS authentication system while maintaining tenant isolation and security.

## Architecture Context

**Current Authentication Stack:**

- **Better Auth**: Handles authentication (sessions, OAuth, MFA)
- **AdonisJS**: Canonical source for user profiles and roles
- **Payload CMS**: Content management with multi-tenant access control

**User Flow:**

1. Users authenticate via Better Auth (main application)
2. User data synced to AdonisJS (canonical storage)
3. Users with content roles synced to Payload (for CMS access)
4. Users can access Payload admin UI using synced credentials

## Authentication Strategy

### Strategy: Hybrid Authentication with User Sync

We use a **hybrid approach** that leverages both Payload's built-in
authentication and our existing auth system:

1. **User Sync**: Users synced from AdonisJS to Payload (one-way)
2. **Payload Admin UI**: Uses Payload's built-in email/password authentication
3. **Local API**: Passes user context directly (no authentication needed)
4. **REST API**: Uses Payload's session-based authentication

### Key Distinction: Local API vs Admin UI

**Local API (AdonisJS → Payload):**

- ✅ **No password required** - runs in same process
- ✅ **No authentication needed** - passes user context directly
- ✅ Works with **either** password sync option (A or B)
- ✅ User context passed via `req.user` parameter

**Admin UI (Browser → Payload):**

- ⚠️ **Password required** - users log in via browser
- ⚠️ **Requires password sync** - Option A or B
- ⚠️ Uses Payload's built-in session authentication

**Summary**: Password sync strategy (Option A vs B) only affects **Admin UI
access**. Local API works regardless of password sync because it doesn't use
passwords.

## User Synchronization

### Who Gets Synced to Payload?

Only users with **content roles** are synced to Payload:

- ✅ `admin` → Synced to Payload
- ✅ `content_admin` → Synced to Payload
- ✅ `editor` → Synced to Payload
- ✅ `writer` → Synced to Payload
- ❌ `user` → NOT synced (no CMS access needed)

### Sync Process

**Location**: `apps/backend/app/services/payload_user_sync_service.ts`

**When users are synced:**

1. Admin creates user with content role
2. User role updated to content role
3. User registration (if role requires it)

**What gets synced:**

```typescript
{
  email: string,              // From AdonisJS user
  password: string,          // Option A: Sync password (see below)
  // OR
  // Option B: Passwordless (see below)

  firstName: string,         // From AdonisJS user
  lastName: string,         // From AdonisJS user
  role: string,             // Mapped from AdonisJS role
  // Payload-specific fields
  enableAPIKey: boolean,    // For programmatic access if needed
}
```

### Password Strategy: Two Options

**Note**: Password sync is **only needed for Payload Admin UI access**. Local
API doesn't require passwords - it uses user context directly.

#### Option A: Password Sync (Recommended for Simplicity)

**How it works:**

- Passwords are synced from Better Auth to Payload during user creation
- Users can log into Payload admin UI with same credentials as main app
- Password changes in Better Auth need to be synced to Payload

**Pros:**

- ✅ Simple user experience (same password everywhere)
- ✅ Easy to implement
- ✅ Users don't need separate Payload credentials

**Cons:**

- ⚠️ Password changes need to be synced
- ⚠️ Password hashes stored in both systems

**Implementation:**

```typescript
// In PayloadUserSyncService
async syncUserToPayload(user: User, password?: string) {
  const payloadUser = await payload.create({
    collection: 'users',
    data: {
      email: user.email,
      password: password || await this.getPasswordFromBetterAuth(user.betterAuthUserId),
      firstName: user.firstName,
      lastName: user.lastName,
      role: this.mapRoleToPayload(user.role),
    },
  });

  // Store mapping
  user.payloadUserId = payloadUser.id;
  await user.save();
}
```

#### Option B: Passwordless Sync (Recommended for Security)

**How it works:**

- Users are created in Payload WITHOUT passwords
- Users must set password on first Payload admin login
- Or use API keys for programmatic access
- Or implement SSO/custom auth strategy

**Pros:**

- ✅ Better security (passwords not duplicated)
- ✅ Clear separation of concerns
- ✅ Can implement SSO later

**Cons:**

- ⚠️ Users need to set Payload password separately
- ⚠️ More complex user experience
- ⚠️ Requires password reset flow in Payload

**Implementation:**

```typescript
// In PayloadUserSyncService
async syncUserToPayload(user: User) {
  // Create user without password
  const payloadUser = await payload.create({
    collection: 'users',
    data: {
      email: user.email,
      // No password - user must set on first login
      firstName: user.firstName,
      lastName: user.lastName,
      role: this.mapRoleToPayload(user.role),
      // Mark as requiring password reset
      resetPasswordToken: generateToken(),
      resetPasswordExpiration: futureDate(),
    },
  });

  // Send email with password setup link
  await this.sendPasswordSetupEmail(user.email, resetToken);
}
```

**Recommendation**:

- **If users need Admin UI access**: Use **Option A (Password Sync)** for
  simplicity
- **If users only need programmatic access**: Use **Option B (Passwordless)**
  and rely on API keys
- **Local API**: Works with either option (doesn't require passwords)

**Decision Matrix:**

- ✅ **Need Admin UI access** → Option A (Password Sync)
- ✅ **Only need Local API** → Either option works (no password needed)
- ✅ **Only need REST API with API keys** → Option B (Passwordless)

## Payload Admin UI Authentication

### Access Control

**Who can access Payload admin UI:**

- Users with roles: `admin`, `content_admin`, `editor`, `writer`
- Must have Payload user account (synced from AdonisJS)

### Authentication Options

#### Option 1: SSO with Better Auth (Recommended for Seamless Experience)

**How it works:**

- Users already logged into main site (Better Auth session)
- Navigate to Payload admin UI
- Payload validates Better Auth session automatically
- Creates Payload session without requiring login
- **Seamless experience** - no re-authentication needed

**Implementation:**

```typescript
// In Payload config: apps/studio/payload.config.ts
import { CollectionConfig } from 'payload/types';
import { auth } from '@better-auth/server'; // Better Auth server instance

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Custom authentication strategy
    strategies: [
      {
        name: 'better-auth-sso',
        authenticate: async ({ headers, payload }) => {
          // Extract Better Auth session from cookie or header
          const sessionCookie = headers.cookie
            ?.split(';')
            .find((c) => c.trim().startsWith('better-auth.session_token='));

          if (!sessionCookie) {
            return null; // No session, fall back to email/password
          }

          const token = sessionCookie.split('=')[1];

          // Validate Better Auth session
          const session = await auth.api.getSession({
            headers: { cookie: `better-auth.session_token=${token}` },
          });

          if (!session?.user) {
            return null; // Invalid session
          }

          // Find Payload user by email (or betterAuthUserId mapping)
          const payloadUser = await payload.find({
            collection: 'users',
            where: {
              email: { equals: session.user.email },
            },
            limit: 1,
          });

          if (!payloadUser.docs[0]) {
            return null; // User not synced to Payload
          }

          // Return Payload user for automatic login
          return {
            id: payloadUser.docs[0].id,
            email: payloadUser.docs[0].email,
            role: payloadUser.docs[0].role,
          };
        },
      },
    ],
  },
  // ... rest of config
};
```

**Frontend Integration:**

```typescript
// In Nuxt: Redirect to Payload admin with session
// apps/web/app/composables/usePayloadAdmin.ts
export function usePayloadAdmin() {
  const { isAuthenticated } = useAuth();
  const payloadAdminUrl = 'http://localhost:3001/admin';

  function openPayloadAdmin() {
    if (isAuthenticated.value) {
      // User is logged in, cookies will be sent automatically
      // Payload will validate Better Auth session via custom strategy
      window.open(payloadAdminUrl, '_blank');
    } else {
      // Redirect to login first
      navigateTo('/login');
    }
  }

  return { openPayloadAdmin };
}
```

**Benefits:**

- ✅ Seamless user experience (no re-login)
- ✅ Single source of authentication (Better Auth)
- ✅ Automatic session validation
- ✅ Works with existing Better Auth sessions

#### Option 2: Traditional Email/Password Login

**How it works:**

1. Navigate to `http://localhost:3001/admin`
2. Enter email and password (synced from Better Auth/AdonisJS)
3. Payload validates credentials using its built-in auth
4. Session created in Payload
5. Access hooks enforce tenant isolation

**Use this if:**

- SSO implementation is not ready
- You want separate authentication for security
- Users need to explicitly log into Payload admin

### Tenant Isolation in Admin UI

Payload's access hooks automatically filter content based on user role:

```typescript
// Example: Posts collection
access: {
  read: ({ req: { user } }) => {
    if (!user) return false;

    // Admins see everything
    if (user.role === 'admin' || user.role === 'content_admin') {
      return true;
    }

    // Writers see only their own
    if (user.role === 'writer') {
      return { createdBy: { equals: user.id } };
    }

    // Editors see all (or can be restricted)
    if (user.role === 'editor') {
      return true; // Or restrict to own if preferred
    }

    return false;
  },
}
```

**Result**: Writers logging into admin UI only see their own posts/spaces, while
admins see everything.

## Local API Authentication

### How It Works

**Local API doesn't require authentication** - it runs in the same Node.js
process as AdonisJS. Instead, we pass user context directly.

**Important**: Local API authentication is **independent** of the password sync
strategy (Option A vs Option B). Password sync is only needed for **Payload
Admin UI access**, not for Local API.

```typescript
// In PayloadService (AdonisJS)
import { getPayload } from 'payload';
import config from '../../studio/src/payload.config';

class PayloadService {
  private payload: Payload;

  async initialize() {
    this.payload = await getPayload({ config });
  }

  async getItems(collection: string, options: { user?: User }) {
    // Map AdonisJS user to Payload user
    const payloadUserId = options.user?.payloadUserId;

    // Build query with user context
    // Payload access hooks will enforce tenant isolation
    return await this.payload.find({
      collection,
      where: {
        // Access hooks automatically filter by createdBy for non-admins
        // We can also explicitly filter if needed
        ...(options.user?.role !== 'admin' && payloadUserId
          ? { createdBy: { equals: payloadUserId } }
          : {}),
      },
      // Pass user context for access control
      req: {
        user: {
          id: payloadUserId,
          role: this.mapRoleToPayload(options.user?.role),
        },
      } as any, // Payload's req type
    });
  }
}
```

### User Context Passing

**Important**: Payload Local API needs user context to enforce access control.
We pass it via the `req` parameter:

```typescript
// Correct way to pass user context
await payload.find({
  collection: 'posts',
  req: {
    user: {
      id: payloadUserId,
      role: 'writer', // or 'admin', 'editor', etc.
      email: user.email,
    },
  } as any,
});
```

**Access hooks** in collections use `req.user` to determine what the user can
see/edit.

## REST API Authentication

### Frontend Access

The frontend (Nuxt) uses Payload's REST API for public content:

```typescript
// In payload-server.ts (Nuxt)
const response = await fetch(`${STUDIO_URL}/api/posts`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // For authenticated requests (if needed):
    // 'Authorization': `Bearer ${apiKey}`,
  },
});
```

### Public vs Authenticated Endpoints

**Public endpoints** (no auth required):

- `GET /api/posts` - Published posts
- `GET /api/pages` - Published pages
- `GET /api/posts/[slug]` - Single published post

**Authenticated endpoints** (require Payload session or API key):

- `POST /api/posts` - Create post
- `PATCH /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### API Keys (Optional)

For programmatic access without user sessions, use Payload API keys:

```typescript
// Enable API keys in Payload user collection
auth: {
  useAPIKey: true,
}

// Generate API key for user
const apiKey = await payload.createAPIKey({
  user: payloadUserId,
});

// Use API key in requests
fetch(`${payloadUrl}/api/posts`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
});
```

**Use cases:**

- Third-party integrations
- Automated scripts
- CI/CD pipelines
- Webhook handlers

## Role Mapping

### AdonisJS → Payload Roles

```typescript
function mapRoleToPayload(adonisRole: string): string {
  const mapping = {
    admin: 'admin', // Full access
    content_admin: 'admin', // Full access (or custom role)
    editor: 'editor', // Can edit all content
    writer: 'writer', // Can only edit own content
  };

  return mapping[adonisRole] || 'writer';
}
```

**Payload Role Structure:**

- `admin`: Full system access, can see/edit all content
- `editor`: Can edit all content (or restricted as configured)
- `writer`: Can only see/edit own content (filtered by `createdBy`)

## Password Management

### Password Changes

**If using Option A (Password Sync):**

1. User changes password in Better Auth
2. Better Auth hook fires (`onAfterUpdateUser`)
3. Sync password to Payload:
   ```typescript
   await payload.update({
     collection: 'users',
     id: payloadUserId,
     data: {
       password: newPassword, // Payload will hash it
     },
   });
   ```

**If using Option B (Passwordless):**

- Password changes in Better Auth don't affect Payload
- Users manage Payload password separately
- Can implement password reset flow in Payload

### Password Reset

**Option A (Password Sync):**

- Use Better Auth's password reset flow
- Sync new password to Payload after reset

**Option B (Passwordless):**

- Use Payload's built-in password reset
- Send reset email from Payload
- User sets new password in Payload admin UI

## Email Synchronization

### One-Way Sync: AdonisJS → Payload

Email changes flow from AdonisJS to Payload:

```typescript
// In EmailSyncService
async syncEmailToPayload(payloadUserId: string, newEmail: string) {
  await payload.update({
    collection: 'users',
    id: payloadUserId,
    data: {
      email: newEmail,
    },
  });
}
```

**Flow:**

1. User changes email in Better Auth
2. Email synced to AdonisJS (canonical)
3. Email synced to Payload (if Payload user exists)

## Security Considerations

### 1. Password Storage

- ✅ Passwords are hashed in both Better Auth and Payload
- ✅ Never store plain text passwords
- ✅ Use strong hashing algorithms (bcrypt, argon2)

### 2. Session Management

- ✅ Payload admin UI uses secure session cookies
- ✅ Sessions expire after inactivity
- ✅ CSRF protection enabled

### 3. Access Control

- ✅ Access hooks enforce tenant isolation
- ✅ Role-based access control in collections
- ✅ `createdBy` field automatically set on create

### 4. API Security

- ✅ REST API endpoints protected by access hooks
- ✅ API keys encrypted in database
- ✅ Rate limiting recommended for public endpoints

### 5. Multi-Tenant Isolation

- ✅ Writers can only see/edit their own content
- ✅ Admins can see all content
- ✅ Access hooks filter queries automatically
- ✅ No cross-tenant data leakage

## Implementation Checklist

### Phase 1: Basic User Sync

- [ ] Create `PayloadUserSyncService`
- [ ] Implement user sync on role assignment
- [ ] Map AdonisJS roles to Payload roles
- [ ] Store `payloadUserId` in AdonisJS User model
- [ ] Test user creation and sync

### Phase 2: Password Strategy

- [ ] Choose password sync strategy (Option A or B)
- [ ] Implement password sync (if Option A)
- [ ] Implement password reset flow
- [ ] Test password changes and sync

### Phase 3: Admin UI Access

- [ ] Configure Payload user collection with auth
- [ ] Test admin UI login with synced users
- [ ] Verify tenant isolation in admin UI
- [ ] Test role-based access (writer vs admin)

### Phase 4: Local API Integration

- [ ] Implement user context passing in PayloadService
- [ ] Test Local API queries with user context
- [ ] Verify access hooks work correctly
- [ ] Test tenant isolation in Local API

### Phase 5: REST API (Frontend)

- [ ] Configure public endpoints
- [ ] Test public content access
- [ ] Implement authenticated endpoints (if needed)
- [ ] Test API key generation (if using)

### Phase 6: Email Sync

- [ ] Implement email sync to Payload
- [ ] Test email change flow
- [ ] Verify email updates in Payload

## SSO Implementation (Seamless Experience)

### Overview

SSO allows users logged into the main site (Better Auth) to automatically access
Payload admin UI without re-authenticating. This provides a seamless user
experience.

### Implementation Steps

#### Step 1: Configure Custom Authentication Strategy in Payload

```typescript
// apps/studio/payload.config.ts
import { PayloadConfig } from 'payload';
import { BetterAuth } from 'better-auth'; // Better Auth instance

const betterAuth = new BetterAuth({
  // Better Auth config
});

export default {
  // ... other config
  collections: [
    {
      slug: 'users',
      auth: {
        strategies: [
          {
            name: 'better-auth-sso',
            authenticate: async ({ headers, payload }) => {
              try {
                // Extract Better Auth session token from cookie
                const cookies = headers.cookie || '';
                const sessionToken = extractSessionToken(cookies);

                if (!sessionToken) {
                  return null; // No session, fall back to email/password
                }

                // Validate Better Auth session
                const session = await betterAuth.api.getSession({
                  headers: {
                    cookie: `better-auth.session_token=${sessionToken}`,
                  },
                });

                if (!session?.user) {
                  return null; // Invalid or expired session
                }

                // Find Payload user by email
                const payloadUser = await payload.find({
                  collection: 'users',
                  where: {
                    email: { equals: session.user.email },
                  },
                  limit: 1,
                });

                if (!payloadUser.docs[0]) {
                  return null; // User not synced to Payload
                }

                // Verify user has content role
                const adonisUser = await findAdonisUserByEmail(
                  session.user.email
                );
                if (!adonisUser || !requiresPayloadUser(adonisUser.role)) {
                  return null; // User doesn't have Payload access
                }

                // Return Payload user for automatic login
                return {
                  id: payloadUser.docs[0].id,
                  email: payloadUser.docs[0].email,
                  role: payloadUser.docs[0].role,
                };
              } catch (error) {
                console.error('SSO authentication error:', error);
                return null; // Fall back to email/password
              }
            },
          },
        ],
        // Still support email/password as fallback
        tokenExpiration: 7200, // 2 hours
      },
      // ... rest of collection config
    },
  ],
} satisfies PayloadConfig;
```

#### Step 2: Helper Functions

```typescript
// apps/studio/src/utils/sso-helpers.ts

/**
 * Extract Better Auth session token from cookie string
 */
export function extractSessionToken(cookies: string): string | null {
  const match = cookies.match(/better-auth\.session_token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Find AdonisJS user by email (via API call or shared database)
 */
async function findAdonisUserByEmail(email: string) {
  // Option A: Call AdonisJS API
  const response = await fetch(`${adonisUrl}/api/public/users/by-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) return null;
  return await response.json();

  // Option B: Direct database access (if same database)
  // return await db.query('SELECT * FROM users WHERE email = ?', [email]);
}

/**
 * Check if role requires Payload user
 */
function requiresPayloadUser(role: string): boolean {
  return ['admin', 'content_admin', 'editor', 'writer'].includes(role);
}
```

#### Step 3: Frontend Integration

```typescript
// apps/web/app/composables/usePayloadAdmin.ts
export function usePayloadAdmin() {
  const { isAuthenticated, user } = useAuth();
  const config = useRuntimeConfig();

  const payloadAdminUrl =
    config.public.payloadAdminUrl || 'http://localhost:3001/admin';

  /**
   * Open Payload admin with SSO
   */
  function openPayloadAdmin() {
    if (!isAuthenticated.value) {
      // Redirect to login first
      navigateTo('/login?redirect=/admin/payload');
      return;
    }

    // Check if user has Payload access
    if (!user.value?.payloadUserId) {
      // User doesn't have Payload access
      // Show message or redirect
      return;
    }

    // Open Payload admin - cookies will be sent automatically
    // Payload will validate Better Auth session via custom strategy
    window.open(payloadAdminUrl, '_blank');
  }

  /**
   * Get Payload admin URL with SSO token (alternative approach)
   */
  function getPayloadAdminUrl(): string {
    // If using token-based approach instead of cookies
    const token = getBetterAuthToken(); // Get from cookie or storage
    return `${payloadAdminUrl}?sso_token=${token}`;
  }

  return {
    openPayloadAdmin,
    getPayloadAdminUrl,
  };
}
```

#### Step 4: Add Admin Link in Main App

```vue
<!-- apps/web/app/components/admin/PayloadAdminLink.vue -->
<template>
  <UButton
    v-if="hasPayloadAccess"
    @click="openPayloadAdmin"
    icon="i-heroicons-cog-6-tooth"
  >
    Open Payload Admin
  </UButton>
</template>

<script setup lang="ts">
const { user } = useAuth();
const { openPayloadAdmin } = usePayloadAdmin();

const hasPayloadAccess = computed(() => {
  if (!user.value) return false;
  return ['admin', 'content_admin', 'editor', 'writer'].includes(
    user.value.role
  );
});
</script>
```

### Security Considerations

1. **Session Validation**: Always validate Better Auth sessions server-side
2. **Token Expiration**: Respect Better Auth session expiration
3. **CORS**: Configure CORS to allow cookie sharing between domains
4. **HTTPS**: Use HTTPS in production for secure cookie transmission
5. **Domain Matching**: Ensure cookies are accessible (same domain or configured
   CORS)

### Cookie Configuration

For SSO to work, Better Auth cookies must be accessible to Payload:

```typescript
// Better Auth config
const betterAuth = new BetterAuth({
  cookies: {
    sameSite: 'lax', // or 'none' for cross-domain
    secure: process.env.NODE_ENV === 'production',
    domain: '.yourdomain.com', // Shared domain for SSO
  },
});
```

### Fallback Behavior

If SSO fails (invalid session, user not found, etc.), Payload falls back to:

1. Email/password login (if Option A password sync)
2. Password reset flow (if Option B passwordless)
3. Error message to user

### Testing SSO

1. Log into main site (Better Auth)
2. Navigate to Payload admin URL
3. Should automatically log in without password prompt
4. Verify tenant isolation works correctly
5. Test session expiration (logout from main site, try Payload admin)

## Future Enhancements

### Additional SSO Options

- **OAuth Integration**: Use Better Auth OAuth providers for Payload
- **JWT Tokens**: Pass JWT tokens instead of session cookies
- **API Gateway**: Centralized SSO via API gateway

### OAuth Integration

Payload supports OAuth providers via plugins:

- Google OAuth
- GitHub OAuth
- Custom OAuth providers

### Two-Factor Authentication

Enhance security with 2FA:

- TOTP (Time-based One-Time Password)
- SMS-based 2FA
- Email-based 2FA

## Troubleshooting

### User Can't Log Into Payload Admin

**Check:**

1. User has Payload user account (check `payloadUserId` in AdonisJS)
2. User has correct role (content role required)
3. Password is synced correctly (if using Option A)
4. Payload user is active/enabled

### Local API Not Respecting Tenant Isolation

**Check:**

1. User context is being passed correctly in `req.user`
2. Access hooks are configured in collections
3. `createdBy` field is set on create operations
4. User role is mapped correctly

### Password Sync Not Working

**Check:**

1. Password sync hook is firing
2. Payload user exists (`payloadUserId` is set)
3. Password is being hashed correctly
4. Better Auth password change event is captured

## Related Documentation

- [Authentication Architecture](./architecture.md) - Better Auth + AdonisJS auth
- [Roles and User Management](./roles-and-user-management.md) - Role system
- [Payload CMS Authentication Docs](https://payloadcms.com/docs/authentication/overview) -
  Official Payload docs
