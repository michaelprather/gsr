<script setup lang="ts">
import { UiButton, UiDialog } from '../ui'
import { IconUserSlashOutline, IconForwardOutline } from '../icons'

export interface SkipPlayerDialogProps {
  open: boolean
  playerName: string
}

export interface SkipPlayerDialogEmits {
  (e: 'skip-round'): void
  (e: 'skip-all'): void
  (e: 'close'): void
}

const { open, playerName } = defineProps<SkipPlayerDialogProps>()
const emit = defineEmits<SkipPlayerDialogEmits>()
</script>

<template>
  <UiDialog :open="open" :title="`Skip ${playerName}`" @close="emit('close')">
    <div class="skip-player-dialog__options">
      <button
        type="button"
        class="skip-player-dialog__option"
        @click="emit('skip-round')"
      >
        <IconUserSlashOutline class="skip-player-dialog__option-icon" />
        <div class="skip-player-dialog__option-content">
          <span class="skip-player-dialog__option-label">Skip this round</span>
          <span class="skip-player-dialog__option-desc">Player will be active again next round</span>
        </div>
      </button>

      <button
        type="button"
        class="skip-player-dialog__option"
        @click="emit('skip-all')"
      >
        <IconForwardOutline class="skip-player-dialog__option-icon" />
        <div class="skip-player-dialog__option-content">
          <span class="skip-player-dialog__option-label">Skip rest of game</span>
          <span class="skip-player-dialog__option-desc">Player will be skipped for all remaining rounds</span>
        </div>
      </button>
    </div>

    <template #actions>
      <UiButton variant="secondary" block @click="emit('close')">Cancel</UiButton>
    </template>
  </UiDialog>
</template>

<style src="./SkipPlayerDialog.css"></style>
