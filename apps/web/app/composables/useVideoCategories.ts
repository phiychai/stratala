import type { Video } from '@turborepo-saas-starter/shared-types';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryMenuItem {
  label: string;
  active: boolean;
  click: () => void;
}

/**
 * Composable for fetching and managing video categories
 */
export function useVideoCategories(videos?: Ref<Video[]>) {
  const route = useRoute();
  const router = useRouter();

  // Fetch all categories for navigation menu
  const { data: categoriesData, error: categoriesError } = useFetch<{
    categories: Category[];
  }>('/api/videos/categories', {
    key: 'videos-categories',
    onResponseError({ response }) {
      console.error(
        'Error fetching categories:',
        response.status,
        response.statusText,
        response._data
      );
    },
  });

  // Fallback: Extract unique categories from videos if categories API fails
  const categories = computed(() => {
    if (categoriesData.value?.categories && categoriesData.value.categories.length > 0) {
      return categoriesData.value.categories;
    }

    // Extract categories from videos categories field as fallback
    if (!videos?.value) {
      return [];
    }

    const categoryMap = new Map<string, Category>();

    videos.value.forEach((video) => {
      if (video.categories) {
        const videoCategories = Array.isArray(video.categories) ? video.categories : [];
        videoCategories.forEach((cat: unknown) => {
          if (typeof cat === 'string' && cat) {
            // If it's a string, create a category from it
            const slug = cat.toLowerCase().replace(/\s+/g, '-');
            if (!categoryMap.has(slug)) {
              categoryMap.set(slug, {
                id: slug,
                name: cat,
                slug,
              });
            }
          } else if (typeof cat === 'object' && cat !== null) {
            // Handle Category type (id can be number or string)
            const catObj = cat as { id?: number | string; title?: string; slug?: string };
            const catId =
              typeof catObj.id === 'number' ? String(catObj.id) : String(catObj.id || '');
            const catTitle = catObj.title ? String(catObj.title) : '';
            const category: Category = {
              id: catId,
              name: catTitle,
              slug: catObj.slug ? String(catObj.slug) : catTitle.toLowerCase().replace(/\s+/g, '-'),
            };
            if (category.id && category.name && !categoryMap.has(category.id)) {
              categoryMap.set(category.id, category);
            }
          }
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  // Function to handle category filter clicks
  function handleCategoryClick(categorySlug: string | undefined) {
    router.push({
      path: route.path,
      query: {
        ...route.query,
        category: categorySlug,
        page: 1, // Reset to first page when filtering
      },
    });
  }

  // Create navigation menu items from categories
  const menuItems = computed<CategoryMenuItem[]>(() => {
    const items: CategoryMenuItem[] = [
      {
        label: 'All',
        active: !route.query.category,
        click: () => handleCategoryClick(undefined),
      },
    ];

    const categoriesToUse = categories.value;

    if (categoriesToUse && categoriesToUse.length > 0) {
      const categoryItems = categoriesToUse.map((category) => ({
        label: category.name,
        active: route.query.category === category.slug,
        click: () => handleCategoryClick(category.slug),
      }));

      items.push(...categoryItems);
    }

    return items;
  });

  return {
    categories,
    menuItems,
    error: categoriesError,
    handleCategoryClick,
  };
}

