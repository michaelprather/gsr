<script setup lang="ts">
import type { Toast } from '@/presentation/entities'
import {
  IconXmark,
  IconCircleCheck,
  IconCircleExclamation,
  IconCircleInfo,
} from '@/presentation/components/icons'

export interface UiToastProps {
  toast: Toast
}

export interface UiToastEmits {
  (e: 'dismiss', id: number): void
}

const { toast } = defineProps<UiToastProps>()
const emit = defineEmits<UiToastEmits>()
</script>

<template>
  <div class="ui-toast" :class="`ui-toast--${toast.variant}`" role="alert">
    <div class="ui-toast__accent" aria-hidden="true" />
    <IconCircleCheck v-if="toast.variant === 'success'" class="ui-toast__icon" aria-hidden="true" />
    <IconCircleExclamation v-else-if="toast.variant === 'error'" class="ui-toast__icon" aria-hidden="true" />
    <IconCircleInfo v-else class="ui-toast__icon" aria-hidden="true" />
    <span class="ui-toast__message">{{ toast.message }}</span>
    <button
      type="button"
      class="ui-toast__dismiss"
      aria-label="Dismiss notification"
      @click="emit('dismiss', toast.id)"
    >
      <IconXmark aria-hidden="true" />
    </button>
  </div>
</template>

<style src="./UiToast.css"></style>
