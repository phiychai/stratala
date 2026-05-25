import { getItems } from '~~/server/utils/payload-server';
interface ContentRecord {
  id?: string | number;
}
interface EditorsPick {
  contentType?: 'post' | 'video';
  post?: number | ContentRecord;
  video?: number | ContentRecord;
  featuredOrder?: number;
}
interface TrendingItem {
  content?: ContentRecord;
  trendingScore?: number;
}

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const backendUrl = config.public.apiUrl || 'http://localhost:3333';
    const query = getQuery(event);
    const type = (query.type as 'post' | 'video' | 'all') || 'all';
    const limit = query.limit ? Number.parseInt(query.limit as string, 10) : undefined;

    try {
      // Fetch editor's picks
      const editorsPicksResult = await getItems<EditorsPick>('editors-picks', {
        where: {},
        limit: 5,
        sort: 'featuredOrder',
        depth: 2,
      });

      // Process editor's picks to get actual content
      const editorsPicks: Array<{
        type: 'post' | 'video';
        content: ContentRecord;
        featuredOrder: number;
      }> = [];

      for (const pick of editorsPicksResult.docs as EditorsPick[]) {
        // Skip if type filter doesn't match
        if (type !== 'all' && pick.contentType !== type) {
          continue;
        }

        if (pick.contentType === 'post' && pick.post) {
          const postContent =
            typeof pick.post === 'object'
              ? pick.post
              : await getItems<ContentRecord>('posts', {
                  where: { id: { equals: pick.post } },
                  depth: 2,
                }).then((r) => r.docs[0]);
          if (postContent) {
            editorsPicks.push({
              type: 'post',
              content: postContent,
              featuredOrder: pick.featuredOrder || 0,
            });
          }
        } else if (pick.contentType === 'video' && pick.video) {
          const videoContent =
            typeof pick.video === 'object'
              ? pick.video
              : await getItems<ContentRecord>('videos', {
                  where: { id: { equals: pick.video } },
                  depth: 2,
                }).then((r) => r.docs[0]);
          if (videoContent) {
            editorsPicks.push({
              type: 'video',
              content: videoContent,
              featuredOrder: pick.featuredOrder || 0,
            });
          }
        }
      }

      // Fetch trending posts and videos from backend based on type filter
      const shouldFetchPosts = type === 'all' || type === 'post';
      const shouldFetchVideos = type === 'all' || type === 'video';

      const fetchPromises: Promise<Response | null>[] = [];
      if (shouldFetchPosts) {
        fetchPromises.push(
          fetch(`${backendUrl}/api/trending?type=post&limit=10`).catch(() => null)
        );
      }
      if (shouldFetchVideos) {
        fetchPromises.push(
          fetch(`${backendUrl}/api/trending?type=video&limit=10`).catch(() => null)
        );
      }

      const responses = await Promise.all(fetchPromises);

      let trendingPosts: Array<{ type: 'post'; content: ContentRecord; score: number }> = [];
      let trendingVideos: Array<{ type: 'video'; content: ContentRecord; score: number }> = [];

      let responseIndex = 0;
      if (shouldFetchPosts) {
        const trendingPostsResponse = responses[responseIndex++];
        if (trendingPostsResponse?.ok) {
          const data = await trendingPostsResponse.json();
          trendingPosts = ((data as { content?: TrendingItem[] }).content || []).map((item) => ({
            type: 'post' as const,
            content: item.content || {},
            score: item.trendingScore ?? 0,
          }));
        }
      }

      if (shouldFetchVideos) {
        const trendingVideosResponse = responses[responseIndex++];
        if (trendingVideosResponse?.ok) {
          const data = await trendingVideosResponse.json();
          trendingVideos = ((data as { content?: TrendingItem[] }).content || []).map((item) => ({
            type: 'video' as const,
            content: item.content || {},
            score: item.trendingScore ?? 0,
          }));
        }
      }

      // Fallback to recent content if trending API fails
      if (shouldFetchPosts && trendingPosts.length === 0) {
        const recentPosts = await getItems<ContentRecord>('posts', {
          where: {
            status: {
              equals: 'published',
            },
          },
          limit: 10,
          sort: '-publishedAt',
          depth: 2,
        });

        trendingPosts = recentPosts.docs.map((item: ContentRecord) => ({
          type: 'post' as const,
          content: item,
          score: 0,
        }));
      }

      if (shouldFetchVideos && trendingVideos.length === 0) {
        const recentVideos = await getItems<ContentRecord>('videos', {
          where: {
            status: {
              equals: 'published',
            },
          },
          limit: 10,
          sort: '-publishedAt',
          depth: 2,
        });

        trendingVideos = recentVideos.docs.map((item: ContentRecord) => ({
          type: 'video' as const,
          content: item,
          score: 0,
        }));
      }

      // Merge all content with type discriminator
      const allContent: Array<{
        type: 'post' | 'video';
        content: ContentRecord;
        source: 'trending' | 'editors-pick';
        score?: number;
        featuredOrder?: number;
      }> = [
        // Editor's picks first (sorted by featuredOrder)
        ...editorsPicks
          .sort((a, b) => a.featuredOrder - b.featuredOrder)
          .map((pick) => ({
            type: pick.type,
            content: pick.content,
            source: 'editors-pick' as const,
            featuredOrder: pick.featuredOrder,
          })),
        // Then trending content (excluding items already in editor's picks)
        ...trendingPosts
          .filter(
            (item) =>
              !editorsPicks.some(
                (pick) =>
                  String(pick.content.id) === String(item.content.id) && pick.type === 'post'
              )
          )
          .map((item) => ({
            type: item.type,
            content: item.content,
            source: 'trending' as const,
            score: item.score,
          })),
        ...trendingVideos
          .filter(
            (item) =>
              !editorsPicks.some(
                (pick) =>
                  String(pick.content.id) === String(item.content.id) && pick.type === 'video'
              )
          )
          .map((item) => ({
            type: item.type,
            content: item.content,
            source: 'trending' as const,
            score: item.score,
          })),
      ];

      // Sort: editor's picks first (by featuredOrder), then trending (by score)
      allContent.sort((a, b) => {
        if (a.source === 'editors-pick' && b.source === 'editors-pick') {
          return (a.featuredOrder || 0) - (b.featuredOrder || 0);
        }
        if (a.source === 'editors-pick') return -1;
        if (b.source === 'editors-pick') return 1;
        return (b.score || 0) - (a.score || 0);
      });

      // Filter by type if specified
      let filteredContent = allContent;
      if (type !== 'all') {
        filteredContent = allContent.filter((item) => item.type === type);
      }

      // Apply limit if specified
      const finalContent = limit ? filteredContent.slice(0, limit) : filteredContent;

      return {
        content: finalContent,
        count: finalContent.length,
      };
    } catch (error: unknown) {
      console.error('Error fetching home content:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch home content',
        data: {
          error: errorMessage,
        },
      });
    }
  },
  {
    maxAge: 60, // Cache for 1 minute
  }
);
