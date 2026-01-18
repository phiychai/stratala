import vine from '@vinejs/vine';

/**
 * Validator for feed query parameters
 */
export const feedQueryValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(100).optional(),
    page: vine.number().min(1).optional(),
    sortBy: vine.enum(['chronological', 'engagement']).optional(),
  })
);
