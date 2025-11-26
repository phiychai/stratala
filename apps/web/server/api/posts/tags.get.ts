import { getItems } from '~~/server/utils/payload-server';

export default defineEventHandler(async (event) => {
  try {
    // Fetch all tags
    const result = await getItems('tags', {
      sort: 'name',
      limit: 1000, // Payload doesn't support -1, use a large number
    });

    return { tags: result.docs };
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch tags', data: error });
  }
});
