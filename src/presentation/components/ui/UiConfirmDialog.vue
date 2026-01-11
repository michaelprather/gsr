<script setup lang="ts">
import UiButton from './UiButton.vue'
import UiDialog from './UiDialog.vue'

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
</script>

<template>
  <UiDialog :open="open" :title="title" @close="emit('cancel')">
    <p class="ui-confirm-dialog__message">{{ message }}</p>

    <template #actions>
      <UiButton variant="secondary" @click="emit('cancel')">
        {{ cancelLabel }}
      </UiButton>
      <UiButton :variant="destructive ? 'destructive' : 'primary'" @click="emit('confirm')">
        {{ confirmLabel }}
      </UiButton>
    </template>
  </UiDialog>
</template>

<style src="./UiConfirmDialog.css"></style>
