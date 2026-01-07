import { getItems } from '~~/server/utils/payload-server';

export default defineEventHandler(async (event) => {
  try {
    // Query categories collection directly
    const result = await getItems('categories', {
      sort: 'title',
      limit: 1000, // Payload doesn't support -1, use a large number
    });

    // Check if result is valid and has docs property
    if (!result || !result.docs || !Array.isArray(result.docs)) {
      console.warn('Categories API returned unexpected format:', result);
      return { categories: [] };
    }

    // Convert to expected format
    const formattedCategories = result.docs
      .map((cat: any) => ({
        id: String(cat.id),
        name: String(cat.title || ''),
        slug: cat.slug
          ? String(cat.slug)
          : String(cat.title || '')
              .toLowerCase()
              .replace(/\s+/g, '-'),
      }))
      .filter((cat) => cat.name) // Only include categories with names
      .sort((a, b) => a.name.localeCompare(b.name));

    return { categories: formattedCategories };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Failed to fetch categories collection:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });

    return { categories: [] };
  }
});

