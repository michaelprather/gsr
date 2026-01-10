<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useOnlineStatus, useTheme } from '@/presentation/composables'
import { IconWifiOffOutline } from '@/presentation/components/icons'
import { UiToastContainer } from '@/presentation/components/ui'

const { isOnline } = useOnlineStatus()

// Initialize theme from localStorage on app load
useTheme()
</script>

<template>
  <div v-if="!isOnline" class="offline-banner">
    <IconWifiOffOutline aria-hidden="true" />
    <span>You're offline</span>
  </div>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <UiToastContainer />
</template>

<style>
.offline-banner {
  --offline-banner-bg: var(--warning-bg, #fef3c7);
  --offline-banner-text: var(--warning-text, #92400e);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--offline-banner-bg);
  color: var(--offline-banner-text);
  font-size: var(--text-sm);
  font-weight: 500;
}

.offline-banner svg {
  width: 1rem;
  height: 1rem;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
