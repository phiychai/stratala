<script setup lang="ts">
const _authStore = useAuthStore();

// Protect admin route - only admin users can access
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

// Admin stats (placeholder data)
const stats = ref({
  totalUsers: 0,
  activeSubscriptions: 0,
  monthlyRevenue: 0,
  supportTickets: 0,
});

// System health status
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number;
}

interface SystemHealth {
  database: HealthStatus;
  adonisApi: HealthStatus;
  payloadCms: HealthStatus;
  lago: HealthStatus;
  timestamp: string;
}

const systemHealth = ref<SystemHealth | null>(null);
const healthLoading = ref(false);
const healthError = ref<string | null>(null);

// Fetch system health status
const fetchSystemHealth = async () => {
  healthLoading.value = true;
  healthError.value = null;

  try {
    const data = await $fetch<SystemHealth>('/api/admin/health');
    systemHealth.value = data;
  } catch (error) {
    healthError.value = error instanceof Error ? error.message : 'Failed to fetch health status';
    console.error('Health check error:', error);
  } finally {
    healthLoading.value = false;
  }
};

// Fetch admin data
onMounted(async () => {
  // TODO: Replace with actual API calls
  stats.value = {
    totalUsers: 1247,
    activeSubscriptions: 856,
    monthlyRevenue: 45230,
    supportTickets: 23,
  };

  // Fetch system health
  await fetchSystemHealth();

  // Refresh health status every 30 seconds
  setInterval(fetchSystemHealth, 30000);
});

// Helper function to get status badge color
const getStatusColor = (
  status: 'healthy' | 'degraded' | 'unhealthy'
): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'unhealthy':
      return 'error';
    default:
      return 'error';
  }
};

// Helper function to get status label
const getStatusLabel = (status: 'healthy' | 'degraded' | 'unhealthy'): string => {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'unhealthy':
      return 'Unhealthy';
    default:
      return 'Unknown';
  }
};

// Helper function to get status indicator color
const getStatusIndicatorColor = (status: 'healthy' | 'degraded' | 'unhealthy'): string => {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'unhealthy':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};
</script>

<template>
  <UDashboardPanel id="admin-dashboard">
    <template #header>
      <UDashboardNavbar title="Admin Dashboard">
        <template #right>
          <UButton label="Back to Site" to="/" variant="ghost" icon="i-heroicons-arrow-left" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="space-y-6">
        <!-- Welcome Section -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">System overview and administration</p>
          </div>
          <UBadge color="error" variant="subtle">
            <Icon name="lucide:shield-check" class="mr-1" />
            Admin
          </UBadge>
        </div>

        <!-- Admin Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Icon name="lucide:users" class="w-5 h-5" />
                <span class="text-sm">Total Users</span>
              </div>
              <p class="text-3xl font-bold">{{ stats.totalUsers.toLocaleString() }}</p>
              <p class="text-xs text-green-600 dark:text-green-400">
                <Icon name="lucide:trending-up" class="w-3 h-3 inline" />
                +12% from last month
              </p>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Icon name="lucide:credit-card" class="w-5 h-5" />
                <span class="text-sm">Active Subscriptions</span>
              </div>
              <p class="text-3xl font-bold">{{ stats.activeSubscriptions.toLocaleString() }}</p>
              <p class="text-xs text-green-600 dark:text-green-400">
                <Icon name="lucide:trending-up" class="w-3 h-3 inline" />
                +8% from last month
              </p>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Icon name="lucide:dollar-sign" class="w-5 h-5" />
                <span class="text-sm">Monthly Revenue</span>
              </div>
              <p class="text-3xl font-bold">${{ (stats.monthlyRevenue / 1000).toFixed(1) }}k</p>
              <p class="text-xs text-green-600 dark:text-green-400">
                <Icon name="lucide:trending-up" class="w-3 h-3 inline" />
                +15% from last month
              </p>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Icon name="lucide:message-square" class="w-5 h-5" />
                <span class="text-sm">Support Tickets</span>
              </div>
              <p class="text-3xl font-bold">{{ stats.supportTickets }}</p>
              <p class="text-xs text-orange-600 dark:text-orange-400">
                <Icon name="lucide:alert-circle" class="w-3 h-3 inline" />
                {{ stats.supportTickets }} pending
              </p>
            </div>
          </UCard>
        </div>

        <!-- Quick Admin Actions -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Quick Actions</h2>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink to="/admin/customers">
              <UButton variant="outline" block>
                <Icon name="lucide:users" class="mr-2" />
                Manage Users
              </UButton>
            </NuxtLink>

            <NuxtLink to="/settings">
              <UButton variant="outline" block>
                <Icon name="lucide:credit-card" class="mr-2" />
                Billing Management
              </UButton>
            </NuxtLink>

            <UButton variant="outline" block @click="navigateTo('/publish')">
              <Icon name="lucide:file-text" class="mr-2" />
              Content Management (Payload CMS)
            </UButton>

            <NuxtLink to="/admin/dashboard">
              <UButton variant="outline" block>
                <Icon name="lucide:bar-chart" class="mr-2" />
                Analytics
              </UButton>
            </NuxtLink>

            <NuxtLink to="/settings/members">
              <UButton variant="outline" block>
                <Icon name="lucide:settings" class="mr-2" />
                System Settings
              </UButton>
            </NuxtLink>

            <NuxtLink to="/admin/customers">
              <UButton variant="outline" block>
                <Icon name="lucide:terminal" class="mr-2" />
                System Logs
              </UButton>
            </NuxtLink>
          </div>
        </UCard>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">Recent Users</h2>
            </template>

            <div class="space-y-3">
              <div class="flex items-center gap-4 py-2 border-b last:border-b-0">
                <div
                  class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold"
                >
                  JD
                </div>
                <div class="flex-1">
                  <p class="font-medium">John Doe</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">john@example.com</p>
                </div>
                <span class="text-xs text-gray-500">2h ago</span>
              </div>
              <div class="flex items-center gap-4 py-2 border-b last:border-b-0">
                <div
                  class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold"
                >
                  JS
                </div>
                <div class="flex-1">
                  <p class="font-medium">Jane Smith</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">jane@example.com</p>
                </div>
                <span class="text-xs text-gray-500">4h ago</span>
              </div>
              <div class="flex items-center gap-4 py-2">
                <div
                  class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold"
                >
                  MB
                </div>
                <div class="flex-1">
                  <p class="font-medium">Mike Brown</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">mike@example.com</p>
                </div>
                <span class="text-xs text-gray-500">1d ago</span>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">System Status</h2>
                <UButton
                  v-if="!healthLoading"
                  icon="i-heroicons-arrow-path"
                  size="xs"
                  variant="ghost"
                  @click="fetchSystemHealth"
                >
                  Refresh
                </UButton>
                <UButton
                  v-else
                  icon="i-heroicons-arrow-path"
                  size="xs"
                  variant="ghost"
                  loading
                  disabled
                >
                  Loading
                </UButton>
              </div>
            </template>

            <div v-if="healthLoading && !systemHealth" class="space-y-4">
              <div class="flex items-center justify-center py-8">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-400" />
                <span class="ml-2 text-gray-500">Checking system health...</span>
              </div>
            </div>

            <div v-else-if="healthError" class="space-y-4">
              <UAlert color="error" variant="soft" :title="healthError" />
            </div>

            <div v-else-if="systemHealth" class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      getStatusIndicatorColor(systemHealth.database.status),
                    ]"
                  />
                  <div class="flex flex-col">
                    <span>Database</span>
                    <span v-if="systemHealth.database.responseTime" class="text-xs text-gray-500">
                      {{ systemHealth.database.responseTime }}ms
                    </span>
                  </div>
                </div>
                <UBadge :color="getStatusColor(systemHealth.database.status)" variant="subtle">
                  {{ getStatusLabel(systemHealth.database.status) }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      getStatusIndicatorColor(systemHealth.adonisApi.status),
                    ]"
                  />
                  <div class="flex flex-col">
                    <span>Adonis API</span>
                    <span v-if="systemHealth.adonisApi.responseTime" class="text-xs text-gray-500">
                      {{ systemHealth.adonisApi.responseTime }}ms
                    </span>
                  </div>
                </div>
                <UBadge :color="getStatusColor(systemHealth.adonisApi.status)" variant="subtle">
                  {{ getStatusLabel(systemHealth.adonisApi.status) }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      getStatusIndicatorColor(systemHealth.payloadCms.status),
                    ]"
                  />
                  <div class="flex flex-col">
                    <span>Payload CMS</span>
                    <span v-if="systemHealth.payloadCms.responseTime" class="text-xs text-gray-500">
                      {{ systemHealth.payloadCms.responseTime }}ms
                    </span>
                  </div>
                </div>
                <UBadge :color="getStatusColor(systemHealth.payloadCms.status)" variant="subtle">
                  {{ getStatusLabel(systemHealth.payloadCms.status) }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      getStatusIndicatorColor(systemHealth.lago.status),
                    ]"
                  />
                  <div class="flex flex-col">
                    <span>Lago Billing</span>
                    <span v-if="systemHealth.lago.responseTime" class="text-xs text-gray-500">
                      {{ systemHealth.lago.responseTime }}ms
                    </span>
                  </div>
                </div>
                <UBadge :color="getStatusColor(systemHealth.lago.status)" variant="subtle">
                  {{ getStatusLabel(systemHealth.lago.status) }}
                </UBadge>
              </div>
              <div v-if="systemHealth.timestamp" class="pt-2 border-t text-xs text-gray-500">
                Last checked: {{ new Date(systemHealth.timestamp).toLocaleTimeString() }}
              </div>
            </div>

            <div v-else class="space-y-4">
              <UAlert color="warning" variant="soft" title="No health data available" />
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
