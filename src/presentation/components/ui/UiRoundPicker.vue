<script setup lang="ts">
import type { Round } from '@/domain'
import { IconLock } from '../../components/icons'

export interface UiRoundPickerProps {
  open: boolean
  rounds: readonly Round[]
  currentIndex: number
}

export interface UiRoundPickerEmits {
  (e: 'select', index: number): void
  (e: 'close'): void
}

const { open, rounds, currentIndex } = defineProps<UiRoundPickerProps>()

const emit = defineEmits<UiRoundPickerEmits>()

function handleSelect(index: number) {
  emit('select', index)
}

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
      class="ui-round-picker"
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-picker-title"
      @click="handleBackdropClick"
      @keydown="handleKeydown"
    >
      <div class="ui-round-picker__panel">
        <h2 id="round-picker-title" class="ui-round-picker__title">Select Round</h2>

        <div class="ui-round-picker__list" role="listbox">
          <button
            v-for="(round, index) in rounds"
            :key="index"
            type="button"
            class="ui-round-picker__item"
            :class="{ 'ui-round-picker__item--active': index === currentIndex }"
            role="option"
            :aria-selected="index === currentIndex"
            @click="handleSelect(index)"
          >
            <div class="ui-round-picker__item-main">
              <span class="ui-round-picker__item-type">{{ round.type.displayName }}</span>
              <span class="ui-round-picker__item-number">Round {{ index + 1 }}</span>
            </div>
            <span v-if="round.isLocked" class="ui-round-picker__item-status">
              <IconLock />
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style src="./UiRoundPicker.css"></style>
