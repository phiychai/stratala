<script setup lang="ts">
const route = useRoute();
const username = route.params.username as string;

const { user, spaces, recentPosts, displayName } = useUserProfile(username);
</script>

<template>
  <UDashboardPanel class="pb-[64px]">
    <template #header>
      <UDashboardNavbar :title="displayName" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UButton
            icon="tabler:x"
            class="mr-3"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="navigateTo('/')"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UContainer class="max-w-[680px]">
        <!-- User Profile Header -->
        <div class="mb-8">
          <div class="flex items-start gap-6 mb-6">
            <div v-if="user?.avatarUrl" class="flex-shrink-0">
              <img
                :src="user.avatarUrl"
                :alt="displayName"
                class="w-24 h-24 rounded-full object-cover border-2 border-default"
              />
            </div>
            <div v-else class="flex-shrink-0">
              <div
                class="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold"
              >
                {{ displayName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-2">{{ displayName }}</h1>
              <p v-if="user?.bio" class="text-muted text-lg mb-4">{{ user.bio }}</p>
              <div class="flex items-center gap-4 text-sm text-muted">
                <span>@{{ username }}</span>
                <span v-if="spaces.length" class="flex items-center gap-1">
                  <Icon name="tabler:folder" class="w-4 h-4" />
                  {{ spaces.length }} {{ spaces.length === 1 ? 'publication' : 'publications' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Spaces Section -->
        <div v-if="spaces.length" class="mb-12">
          <h2 class="text-2xl font-bold mb-4">Publications</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NuxtLink
              v-for="space in spaces"
              :key="space.id"
              :to="`/@${username}/${space.slug}`"
              class="block"
            >
              <UCard class="hover:shadow-lg transition-shadow">
                <div class="p-4">
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="text-lg font-semibold">{{ space.name }}</h3>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-muted">
                    <Icon name="tabler:folder" class="w-3 h-3" />
                    <span>/{{ space.slug }}</span>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Posts Section -->
        <div v-if="recentPosts.length" class="mb-12">
          <h2 class="text-2xl font-bold mb-4">Recent Posts</h2>
          <div class="space-y-6">
            <div
              v-for="post in recentPosts"
              :key="post.id"
              class="border-b border-default pb-6 last:border-0"
            >
              <NuxtLink
                :to="
                  post.tenant && typeof post.tenant !== 'string'
                    ? `/@${username}/${post.tenant.slug}/${post.slug}`
                    : `/@${username}/article/${post.slug}`
                "
                class="block hover:text-accent group"
              >
                <div class="flex gap-4">
                  <div v-if="post.image" class="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                    <PayloadImage
                      :uuid="post.image as string"
                      :alt="post.title || 'Post image'"
                      class="object-cover w-full h-full"
                      width="128"
                      height="96"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        v-if="post.tenant && typeof post.tenant !== 'string'"
                        class="text-xs text-muted"
                      >
                        {{ post.tenant.name }}
                      </span>
                    </div>
                    <h3 class="text-xl font-bold mb-2 group-hover:underline line-clamp-2">
                      {{ post.title }}
                    </h3>
                    <p v-if="post.description" class="text-muted mb-2 line-clamp-2">
                      {{ post.description }}
                    </p>
                    <div class="flex items-center gap-2 text-sm text-muted">
                      <time v-if="post.published_at">
                        {{
                          new Date(post.published_at).toLocaleDateString('en', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        }}
                      </time>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!spaces.length && !recentPosts.length" class="text-center py-12">
          <Icon name="tabler:user" class="w-16 h-16 text-muted mx-auto mb-4" />
          <p class="text-muted text-lg">No publications or posts yet.</p>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
