<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Game } from '@/domain'
import { calculateRankings, findFirstInvalidRoundIndex } from '@/domain'
import { useGameService, useNewGame, useOrientation, useToast } from '../composables'
import { IconChevronLeft, IconPlus } from '../components/icons'
import { UiButton, UiConfirmDialog } from '../components/ui'
import { AppBrand } from '../components/layout'
import { GameScorecard, ShareGameDialog, StandingsList, WinnerCelebration } from '../components/domain'
import type { Winner } from '../components/domain'

const router = useRouter()
const route = useRoute()
const { orientation } = useOrientation()
const service = useGameService()
const newGame = useNewGame()
const toast = useToast()

const game = ref<Game | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const showCelebration = ref(false)
const celebrationDismissed = ref(false)
const showShareDialog = ref(false)

const isEnded = computed(() => game.value?.isEnded ?? false)

const winners = computed<Winner[]>(() => {
  if (!game.value || !isEnded.value) return []

  const rankings = calculateRankings(game.value)
  const topRank = rankings.find((r) => r.rank === 1)
  if (!topRank) return []

  return rankings
    .filter((r) => r.rank === 1)
    .map((r) => ({ name: r.playerName, score: r.total }))
})

const shouldShowCelebration = computed(() => {
  return isEnded.value && showCelebration.value && !celebrationDismissed.value && winners.value.length > 0
})

const currentRoundNumber = computed(() => {
  if (!game.value) return 1

  const invalidIndex = findFirstInvalidRoundIndex(game.value)
  if (invalidIndex >= 0) {
    return invalidIndex + 1
  }

  return game.value.rounds.length
})

const totalRounds = computed(() => {
  return game.value?.rounds.length ?? 0
})

onMounted(async () => {
  try {
    const loadedGame = await service.loadGame()
    if (!loadedGame) {
      router.replace({ name: 'setup' })
      return
    }
    game.value = loadedGame

    // Show celebration when arriving from game end (via query param)
    if (loadedGame.isEnded && route.query.celebrate === 'true') {
      showCelebration.value = true
      // Clear the query param from URL without triggering navigation
      router.replace({ name: 'standings', query: {} })
    }
  } catch {
    loadError.value = 'Failed to load game'
  } finally {
    isLoading.value = false
  }
})

function handleCelebrationDismiss() {
  celebrationDismissed.value = true
  showCelebration.value = false
}

function goBack() {
  router.push({ name: 'game' })
}

async function handleEditScores() {
  if (!game.value?.isEnded) {
    goBack()
    return
  }

  try {
    await service.reopenGame()
    router.push({ name: 'game' })
  } catch {
    toast.error('Failed to reopen game')
  }
}
</script>

<template>
  <div v-if="isLoading" class="standings-view__loading">Loading...</div>

  <div v-else-if="loadError" class="standings-view__error">{{ loadError }}</div>

  <main v-else-if="game" class="standings-view" :class="`standings-view--${orientation}`">
    <header class="standings-view__header">
      <div class="standings-view__title-bar">
        <AppBrand size="small" />
        <UiButton
          variant="ghost"
          size="icon"
          aria-label="New game"
          title="New game"
          @click="newGame.openDialog"
        >
          <IconPlus />
        </UiButton>
      </div>

      <div class="standings-view__nav">
        <UiButton
          variant="ghost"
          size="icon"
          :aria-label="isEnded ? 'Edit scores' : 'Back to score entry'"
          @click="handleEditScores"
        >
          <IconChevronLeft />
        </UiButton>

        <div class="standings-view__title-area">
          <h1 class="standings-view__title">{{ isEnded ? 'Final Results' : 'Standings' }}</h1>
          <span v-if="!isEnded" class="standings-view__round-indicator">
            Round {{ currentRoundNumber }} of {{ totalRounds }}
          </span>
          <span v-else class="standings-view__round-indicator">
            Game Complete
          </span>
        </div>

        <div class="standings-view__spacer" />
      </div>
    </header>

    <section class="standings-view__content" :class="{ 'standings-view__content--landscape': orientation === 'landscape' }">
      <StandingsList v-if="orientation === 'portrait'" :game="game" :is-ended="isEnded" />
      <GameScorecard v-else :game="game" />
    </section>

    <footer v-if="orientation === 'portrait'" class="standings-view__footer">
      <UiButton block variant="secondary" @click="showShareDialog = true">
        Share Game
      </UiButton>
    </footer>

    <UiConfirmDialog
      :open="newGame.showDialog.value"
      title="Start New Game"
      message="This will end your current game. All scores will be lost."
      confirm-label="New Game"
      :destructive="true"
      @confirm="newGame.confirm"
      @cancel="newGame.closeDialog"
    />

    <WinnerCelebration
      v-if="shouldShowCelebration"
      :winners="winners"
      @dismiss="handleCelebrationDismiss"
    />

    <ShareGameDialog
      :open="showShareDialog"
      :game="game"
      @close="showShareDialog = false"
    />
  </main>
</template>

<style src="./StandingsView.css"></style>
