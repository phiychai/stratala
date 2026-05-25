import { getGlobal } from '../utils/payload-server';

export default defineEventHandler(async (_event) => {
  try {
    // Payload globals are accessed via /api/globals/{global-slug}
    const [siteSettings, navigation] = await Promise.all([
      getGlobal('site-settings', {
        depth: 1,
      }),
      getGlobal('navigation', {
        depth: 2, // Include nested navigation items
      }),
    ]);

    // Payload navigation structure may be different - adjust as needed
    return {
      globals: siteSettings,
      headerNavigation: navigation,
      footerNavigation: navigation, // Adjust if you have separate footer navigation
    };
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
