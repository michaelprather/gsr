<script setup lang="ts">
import { computed } from 'vue'

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type UiButtonSize = 'default' | 'small' | 'icon'

export interface UiButtonProps {
  variant?: UiButtonVariant
  size?: UiButtonSize
  block?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

const {
  variant = 'primary',
  size = 'default',
  block = false,
  disabled = false,
  loading = false,
  type = 'button',
  ariaLabel,
} = defineProps<UiButtonProps>()

const classes = computed(() => [
  'ui-button',
  `ui-button--${variant}`,
  {
    'ui-button--small': size === 'small',
    'ui-button--icon': size === 'icon',
    'ui-button--block': block,
  },
])

const isDisabled = computed(() => disabled || loading)
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    :aria-busy="loading"
  >
    <slot />
  </button>
</template>

<style src="./UiButton.css"></style>
