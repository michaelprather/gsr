<script setup lang="ts">
import { useId } from 'vue'

export interface UiDialogProps {
  open: boolean
  title: string
}

export interface UiDialogEmits {
  (e: 'close'): void
}

export interface UiDialogSlots {
  default(): unknown
  actions?(): unknown
}

const { open, title } = defineProps<UiDialogProps>()
const emit = defineEmits<UiDialogEmits>()
defineSlots<UiDialogSlots>()

const titleId = useId()

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="ui-dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click="handleBackdropClick"
      @keydown="handleKeydown"
    >
      <div class="ui-dialog__panel">
        <h2 :id="titleId" class="ui-dialog__title">{{ title }}</h2>
        <div class="ui-dialog__content">
          <slot />
        </div>
        <div v-if="$slots.actions" class="ui-dialog__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style src="./UiDialog.css"></style>
