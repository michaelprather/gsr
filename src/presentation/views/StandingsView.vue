<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Game } from '@/domain'
import { validateRoundCompletion } from '@/domain'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { useOrientation } from '../composables'
import { IconChevronLeft } from '../components/icons'
import { UiButton } from '../components/ui'
import { GameScorecard, StandingsList } from '../components/domain'

const router = useRouter()
const { orientation } = useOrientation()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const game = ref<Game | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const isEnded = computed(() => game.value?.isEnded ?? false)

const currentRoundNumber = computed(() => {
  if (!game.value) return 1

  for (let i = 0; i < game.value.rounds.length; i++) {
    const round = game.value.rounds[i]
    if (!round) continue
    const feedback = validateRoundCompletion(round, i, game.value.players)
    if (feedback.hasFeedback) {
      return i + 1
    }
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
  } catch {
    loadError.value = 'Failed to load game'
  } finally {
    isLoading.value = false
  }
})

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
    // Error handling - could show toast
  }
}
</script>

<template>
  <div v-if="isLoading" class="standings-view__loading">Loading...</div>

  <div v-else-if="loadError" class="standings-view__error">{{ loadError }}</div>

  <main v-else-if="game" class="standings-view" :class="`standings-view--${orientation}`">
    <header class="standings-view__header">
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
    </header>

    <section class="standings-view__content" :class="{ 'standings-view__content--landscape': orientation === 'landscape' }">
      <StandingsList v-if="orientation === 'portrait'" :game="game" :is-ended="isEnded" />
      <GameScorecard v-else :game="game" />
    </section>
  </main>
</template>

<style src="./StandingsView.css"></style>
