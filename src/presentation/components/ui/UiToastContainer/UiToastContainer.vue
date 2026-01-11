<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '@/presentation/composables'
import { UiToast } from '../UiToast'

const { toasts, dismiss } = useToast()

// Reverse order for desktop (newest at bottom) handled in CSS via flex-direction
const orderedToasts = computed(() => [...toasts.value])
</script>

<template>
  <Teleport to="body">
    <div class="ui-toast-container" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast">
        <UiToast v-for="toast in orderedToasts" :key="toast.id" :toast="toast" @dismiss="dismiss" />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style src="./UiToastContainer.css"></style>
