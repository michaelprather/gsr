<script setup lang="ts">
import { useId } from 'vue'
import UiButton from './UiButton.vue'

export interface UiConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export interface UiConfirmDialogEmits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const {
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
} = defineProps<UiConfirmDialogProps>()

const emit = defineEmits<UiConfirmDialogEmits>()

const titleId = useId()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('cancel')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="ui-confirm-dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click="handleBackdropClick"
      @keydown="handleKeydown"
    >
      <div class="ui-confirm-dialog__panel">
        <h2 :id="titleId" class="ui-confirm-dialog__title">{{ title }}</h2>
        <p class="ui-confirm-dialog__message">{{ message }}</p>
        <div class="ui-confirm-dialog__actions">
          <UiButton variant="secondary" @click="handleCancel">
            {{ cancelLabel }}
          </UiButton>
          <UiButton
            :variant="destructive ? 'destructive' : 'primary'"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style src="./UiConfirmDialog.css"></style>
