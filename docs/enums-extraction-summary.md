# Enums Extraction Summary

This document summarizes the enums that were extracted and refactored throughout the codebase.

## Created Enums

### 1. UserStatus Enum (`apps/web/app/types/enums.ts`)

**Purpose**: Represents user subscription/account status

**Values**:
- `SUBSCRIBED` - Active user
- `UNSUBSCRIBED` - Inactive user
- `BOUNCED` - Email bounced

**Helper Functions**:
- `USER_STATUS_LABELS` - Display labels for UI
- `USER_STATUS_COLORS` - Color mapping for badges
- `getUserStatusOptions()` - Options for select dropdowns

**Files Refactored**:
- `apps/web/app/pages/admin/customers.vue`
- `apps/web/app/components/customers/EditModal.vue`
- `apps/web/app/types/index.ts` (now uses enum type)

### 2. UserRole Enum (Re-exported from shared-types)

**Purpose**: Centralized user role definitions

**Values**:
- `USER` - General user
- `ADMIN` - Administrator
- `CONTENT_ADMIN` - Content admin
- `EDITOR` - Editor
- `PUBLISHER` - Publisher

**Helper Functions**:
- `getRoleOptions(includeAllRoles)` - Options for select dropdowns
- `ROLE_LABELS` - Display labels (from shared-types)

**Files Refactored**:
- `apps/web/app/components/customers/AddModal.vue`
- `apps/web/app/components/customers/EditModal.vue`
- `apps/web/app/pages/admin/customers.vue`
- `apps/web/app/middleware/admin.ts`
- `apps/web/app/stores/auth.ts`

### 3. ToastColor Enum

**Purpose**: Colors for toast notifications

**Values**:
- `PRIMARY`
- `SUCCESS`
- `ERROR`
- `WARNING`
- `INFO`

**Note**: Created but not yet fully refactored (can be used in future improvements)

### 4. FormFieldType Enum

**Purpose**: Types of form fields

**Values**:
- `TEXT`
- `PASSWORD`
- `EMAIL`
- `TEXTAREA`
- `CHECKBOX`
- `CHECKBOX_GROUP`
- `RADIO`
- `SELECT`
- `FILE`

**Note**: Created for future use

### 5. RequestStatus Enum

**Purpose**: Status values for async operations

**Values**:
- `IDLE`
- `PENDING`
- `SUCCESS`
- `ERROR`

**Note**: Created for future use

## Benefits

1. **Type Safety**: Enums prevent typos and invalid values
2. **Consistency**: Single source of truth for values
3. **Maintainability**: Update values in one place
4. **IntelliSense**: Better autocomplete in IDEs
5. **Refactoring**: Easier to find and replace values

## Before vs After

### Before:
```typescript
role: z.enum(['user', 'admin', 'content_admin', 'editor', 'writer'])
status: user.isActive ? 'subscribed' : 'unsubscribed'
if (authStore.user?.role !== 'admin') { ... }
```

### After:
```typescript
role: z.enum(USER_ROLES as [string, ...string[]])
status: user.isActive ? UserStatus.SUBSCRIBED : UserStatus.UNSUBSCRIBED
if (authStore.user?.role !== UserRole.ADMIN) { ... }
```

## Future Improvements

1. **ToastColor Usage**: Refactor toast notifications to use `ToastColor` enum
2. **FormFieldType Usage**: Use enum in form field definitions
3. **RequestStatus Usage**: Use enum for async operation states
4. **Additional Enums**: Consider extracting more magic strings (e.g., layout names, route names)

