<script setup lang="ts">
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
      :aria-labelledby="'dialog-title'"
      @click="handleBackdropClick"
      @keydown="handleKeydown"
    >
      <div class="ui-confirm-dialog__panel">
        <h2 id="dialog-title" class="ui-confirm-dialog__title">{{ title }}</h2>
        <p class="ui-confirm-dialog__message">{{ message }}</p>
        <div class="ui-confirm-dialog__actions">
          <button
            type="button"
            class="ui-confirm-dialog__button ui-confirm-dialog__button--cancel"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="ui-confirm-dialog__button ui-confirm-dialog__button--confirm"
            :class="{ 'ui-confirm-dialog__button--destructive': destructive }"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style src="./UiConfirmDialog.css"></style>
