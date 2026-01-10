<script setup lang="ts">
import { useId } from 'vue'
import { UiButton } from '../ui'
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
  <div
    v-if="open"
    class="skip-player-dialog"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
  >
    <div class="skip-player-dialog__panel">
      <h2 :id="titleId" class="skip-player-dialog__title">Skip {{ playerName }}</h2>

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

      <div class="skip-player-dialog__actions">
        <UiButton variant="secondary" block @click="emit('close')">Cancel</UiButton>
      </div>
    </div>
  </div>
</template>

<style src="./SkipPlayerDialog.css"></style>
