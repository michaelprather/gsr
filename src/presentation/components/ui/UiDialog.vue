<script setup lang="ts">
import { ref, watch, useId, nextTick } from 'vue'

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
const panelRef = ref<HTMLElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusableElements(): HTMLElement[] {
  if (!panelRef.value) return []
  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

// Focus management: save previous focus, move to dialog, restore on close
watch(
  () => open,
  async (isOpen) => {
    if (isOpen) {
      previousFocus.value = document.activeElement as HTMLElement | null
      await nextTick()
      const focusable = getFocusableElements()
      const firstFocusable = focusable[0]
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        panelRef.value?.focus()
      }
    } else if (previousFocus.value) {
      previousFocus.value.focus()
      previousFocus.value = null
    }
  },
)

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
    return
  }

  // Focus trap: cycle focus within dialog
  if (event.key === 'Tab') {
    const focusable = getFocusableElements()
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="ui-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div ref="panelRef" class="ui-dialog__panel" tabindex="-1">
          <h2 :id="titleId" class="ui-dialog__title">{{ title }}</h2>
          <div class="ui-dialog__content">
            <slot />
          </div>
          <div v-if="$slots.actions" class="ui-dialog__actions">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="./UiDialog.css"></style>
