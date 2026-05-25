import { getItems } from '~~/server/utils/payload-server';
type SpaceDoc = {
  id?: string | number;
  name?: string;
  slug?: string;
  description?: string | null;
};

export default defineCachedEventHandler(async (_event) => {
  try {
    // Fetch all spaces (tenants collection)
    const result = await getItems('tenants', {
      where: {},
      limit: 50,
      sort: '-createdAt',
      depth: 1,
    });

    const spaces = result.docs.map((space: SpaceDoc) => ({
      id: String(space.id),
      name: space.name || '',
      slug: space.slug || '',
      description: space.description || null,
    }));

    return {
      spaces,
      count: spaces.length,
    };
  } catch (error: unknown) {
    console.error('Error fetching spaces:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch spaces',
      data: {
        error: errorMessage,
      },
    });
  }
});
