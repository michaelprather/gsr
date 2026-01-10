<script setup lang="ts">
import { useId } from 'vue'
import type { Round } from '@/domain'
import { IconLock } from '../icons'

export interface RoundPickerProps {
  open: boolean
  rounds: readonly Round[]
  currentIndex: number
}

export interface RoundPickerEmits {
  (e: 'select', index: number): void
  (e: 'close'): void
}

const { open, rounds, currentIndex } = defineProps<RoundPickerProps>()

const emit = defineEmits<RoundPickerEmits>()

const titleId = useId()

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
      class="round-picker"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click="handleBackdropClick"
      @keydown="handleKeydown"
    >
      <div class="round-picker__panel">
        <h2 :id="titleId" class="round-picker__title">Select Round</h2>

        <div class="round-picker__list" role="listbox" :aria-label="'Available rounds'">
          <button
            v-for="(round, index) in rounds"
            :key="index"
            type="button"
            class="round-picker__item"
            :class="{ 'round-picker__item--active': index === currentIndex }"
            role="option"
            :aria-selected="index === currentIndex"
            @click="handleSelect(index)"
          >
            <div class="round-picker__item-main">
              <span class="round-picker__item-type">{{ round.type.displayName }}</span>
              <span class="round-picker__item-number">Round {{ index + 1 }}</span>
            </div>
            <span
              v-if="round.isLocked"
              class="round-picker__item-status"
              aria-label="Locked"
            >
              <IconLock />
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style src="./RoundPicker.css"></style>
