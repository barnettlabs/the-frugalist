<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BuildingStorefrontIcon,
  MegaphoneIcon,
  UsersIcon,
  BugAntIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'
import {
  adminRetailersApi,
  adminAnnouncementsApi,
  adminUsersApi,
  adminBugReportsApi,
} from '@/api/admin'

const stats = ref({
  retailers: { total: 0, active: 0 },
  announcements: 0,
  users: 0,
  bugReportsNew: 0,
})
const loading = ref(true)

onMounted(async () => {
  try {
    const [retailers, announcements, users, bugs] = await Promise.all([
      adminRetailersApi.list(),
      adminAnnouncementsApi.list(),
      adminUsersApi.list({ page: 1 }),
      adminBugReportsApi.list({ status: 'new' }),
    ])
    stats.value = {
      retailers: { total: retailers.length, active: retailers.filter(r => r.is_active).length },
      announcements: announcements.length,
      users: users.total,
      bugReportsNew: bugs.total,
    }
  } finally {
    loading.value = false
  }
})

const cards = [
  {
    name: 'Retailers',
    href: '/admin/retailers',
    icon: BuildingStorefrontIcon,
    desc: 'Toggle integrations, rotate API keys, manage rate limits.',
  },
  {
    name: 'Announcements',
    href: '/admin/announcements',
    icon: MegaphoneIcon,
    desc: 'Author and publish in-app announcements.',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UsersIcon,
    desc: 'Search users, grant or revoke admin access.',
  },
  {
    name: 'Bug Reports',
    href: '/admin/bug-reports',
    icon: BugAntIcon,
    desc: 'Triage incoming bug reports from the app.',
  },
]
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <header class="mb-10">
      <p class="eyebrow">Admin · Overview</p>
      <h1 class="font-display font-medium text-primary tracking-tight text-3xl sm:text-4xl mt-2">
        Manage the system.
      </h1>
      <p class="mt-3 text-text-muted text-sm max-w-xl">
        Configure integrations, broadcast announcements, support users, and triage bugs.
      </p>
    </header>

    <!-- Stat strip -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div class="card p-5">
        <p class="eyebrow">Retailers</p>
        <p class="figure text-2xl text-primary mt-2">
          {{ loading ? '·' : `${stats.retailers.active} / ${stats.retailers.total}` }}
        </p>
        <p class="text-xs text-text-muted mt-1">active</p>
      </div>
      <div class="card p-5">
        <p class="eyebrow">Announcements</p>
        <p class="figure text-2xl text-primary mt-2">{{ loading ? '·' : stats.announcements }}</p>
        <p class="text-xs text-text-muted mt-1">total</p>
      </div>
      <div class="card p-5">
        <p class="eyebrow">Users</p>
        <p class="figure text-2xl text-primary mt-2">{{ loading ? '·' : stats.users }}</p>
        <p class="text-xs text-text-muted mt-1">registered</p>
      </div>
      <div class="card p-5">
        <p class="eyebrow">New bugs</p>
        <p class="figure text-2xl mt-2" :class="stats.bugReportsNew > 0 ? 'text-danger' : 'text-primary'">
          {{ loading ? '·' : stats.bugReportsNew }}
        </p>
        <p class="text-xs text-text-muted mt-1">unhandled</p>
      </div>
    </div>

    <!-- Resource cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RouterLink v-for="c in cards" :key="c.name" :to="c.href"
        class="card p-6 group hover:border-accent transition-colors">
        <div class="flex items-start gap-4">
          <div class="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
            <component :is="c.icon" class="h-5 w-5 text-accent" />
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-lg text-primary tracking-tight">{{ c.name }}</h3>
              <ArrowRightIcon class="h-4 w-4 text-text-muted group-hover:text-accent transition-colors" />
            </div>
            <p class="text-sm text-text-muted mt-1">{{ c.desc }}</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
