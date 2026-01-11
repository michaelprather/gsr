<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ShareDecodeError } from '@/application'
import { useGameService, useGameShare, useToast } from '../composables'
import { UiButton, UiConfirmDialog } from '../components/ui'
import { AppBrand } from '../components/layout'

const router = useRouter()
const route = useRoute()
const service = useGameService()
const shareService = useGameShare()
const toast = useToast()

const isLoading = ref(true)
const error = ref<string | null>(null)
const showConfirmDialog = ref(false)
const pendingGame = ref<ReturnType<typeof shareService.decode> | null>(null)

onMounted(async () => {
  const data = route.query.data as string | undefined

  if (!data) {
    error.value = 'No game data provided'
    isLoading.value = false
    return
  }

  try {
    const game = shareService.decode(data)
    const existingGame = await service.loadGame()

    if (existingGame && !existingGame.isEnded) {
      // Show confirmation dialog
      pendingGame.value = game
      showConfirmDialog.value = true
      isLoading.value = false
    } else {
      // No existing game or game is ended, import directly
      await importGame(game)
    }
  } catch (e) {
    if (e instanceof ShareDecodeError) {
      error.value = e.message
    } else {
      error.value = 'Failed to import game'
    }
    isLoading.value = false
  }
})

async function importGame(game: ReturnType<typeof shareService.decode>) {
  try {
    await service.importGame(game)
    toast.success('Game imported successfully')
    router.replace({ name: 'game' })
  } catch {
    error.value = 'Failed to save imported game'
    isLoading.value = false
  }
}

async function handleConfirm() {
  showConfirmDialog.value = false
  if (pendingGame.value) {
    isLoading.value = true
    await importGame(pendingGame.value)
  }
}

function handleCancel() {
  showConfirmDialog.value = false
  router.replace({ name: 'game' })
}

function goToSetup() {
  router.replace({ name: 'setup' })
}
</script>

<template>
  <main class="import-view">
    <header class="import-view__header">
      <AppBrand />
    </header>

    <section class="import-view__content">
      <div v-if="isLoading" class="import-view__loading">Importing game...</div>

      <div v-else-if="error" class="import-view__error">
        <p class="import-view__error-message">{{ error }}</p>
        <UiButton @click="goToSetup">Go to Setup</UiButton>
      </div>
    </section>

    <UiConfirmDialog
      :open="showConfirmDialog"
      title="Replace Current Game"
      message="You have a game in progress. Importing this game will replace it and all scores will be lost."
      confirm-label="Import Game"
      :destructive="true"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </main>
</template>

<style src="./ImportView.css"></style>
