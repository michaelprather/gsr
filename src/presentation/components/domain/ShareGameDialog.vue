<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import type { Game } from '@/domain'
import { useGameShare, useToast } from '../../composables'
import { UiButton, UiDialog } from '../ui'
import { IconCircleCheck, IconCopy } from '../icons'

export interface ShareGameDialogProps {
  open: boolean
  game: Game
}

export interface ShareGameDialogEmits {
  (e: 'close'): void
}

const { open, game } = defineProps<ShareGameDialogProps>()
const emit = defineEmits<ShareGameDialogEmits>()

const shareService = useGameShare()
const toast = useToast()

const qrDataUrl = ref<string | null>(null)
const shareUrl = ref('')
const isGenerating = ref(false)
const copied = ref(false)

async function generateQRCode() {
  if (!game) return

  isGenerating.value = true
  try {
    const origin = window.location.origin
    shareUrl.value = shareService.createShareUrl(game, origin)

    qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  } catch {
    toast.error('Failed to generate QR code')
  } finally {
    isGenerating.value = false
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.error('Failed to copy link')
  }
}

function handleClose() {
  emit('close')
}

watch(
  () => open,
  (isOpen) => {
    if (isOpen) {
      generateQRCode()
    }
  },
)

onMounted(() => {
  if (open) {
    generateQRCode()
  }
})
</script>

<template>
  <UiDialog :open="open" title="Share Game" @close="handleClose">
    <div class="share-game-dialog">
      <p class="share-game-dialog__instructions">
        Scan this QR code on another device to import this game.
      </p>

      <div class="share-game-dialog__qr-container">
        <div v-if="isGenerating" class="share-game-dialog__loading">Generating...</div>
        <img
          v-else-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR code to share game"
          class="share-game-dialog__qr"
        />
      </div>

      <p class="share-game-dialog__fallback-text">Or copy the share link:</p>
    </div>

    <template #actions>
      <UiButton variant="secondary" :disabled="copied" @click="copyLink">
        <IconCircleCheck v-if="copied" />
        <IconCopy v-else />
        {{ copied ? 'Copied' : 'Copy Link' }}
      </UiButton>
      <UiButton @click="handleClose">Done</UiButton>
    </template>
  </UiDialog>
</template>

<style src="./ShareGameDialog.css"></style>
