<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Game } from '@/domain'
import { calculateRankings, validateRoundCompletion } from '@/domain'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { IconChevronLeft, IconUserSlashOutline } from '../components/icons'
import { UiButton } from '../components/ui'

const router = useRouter()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const game = ref<Game | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const rankings = computed(() => {
  if (!game.value) return []
  return calculateRankings(game.value)
})

const currentRoundNumber = computed(() => {
  if (!game.value) return 1

  // Find first incomplete round
  for (let i = 0; i < game.value.rounds.length; i++) {
    const feedback = validateRoundCompletion(game.value.rounds[i]!, i, game.value.players)
    if (feedback.hasFeedback) {
      return i + 1
    }
  }

  // All rounds complete
  return game.value.rounds.length
})

const totalRounds = computed(() => {
  return game.value?.rounds.length ?? 0
})

onMounted(async () => {
  try {
    const loadedGame = await service.loadGame()
    if (!loadedGame || loadedGame.isEnded) {
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
</script>

<template>
  <div v-if="isLoading" class="summary-view__loading">Loading...</div>

  <div v-else-if="loadError" class="summary-view__error">{{ loadError }}</div>

  <main v-else-if="game" class="summary-view">
    <header class="summary-view__header">
      <UiButton variant="ghost" size="icon" aria-label="Back to score entry" @click="goBack">
        <IconChevronLeft />
      </UiButton>

      <div class="summary-view__title-area">
        <h1 class="summary-view__title">Standings</h1>
        <span class="summary-view__round-indicator">
          Round {{ currentRoundNumber }} of {{ totalRounds }}
        </span>
      </div>

      <div class="summary-view__spacer" />
    </header>

    <section class="summary-view__content">
      <ol class="summary-view__rankings">
        <li v-for="player in rankings" :key="player.playerId" class="summary-view__player-row">
          <span class="summary-view__rank">{{ player.rank }}</span>

          <div class="summary-view__player-info">
            <span class="summary-view__player-name">
              {{ player.playerName }}
              <span v-if="player.hasSkippedRounds" class="summary-view__skipped-badge">
                <IconUserSlashOutline class="summary-view__skipped-icon" />
                Skipped
              </span>
            </span>
          </div>

          <span class="summary-view__total">{{ player.total }}</span>
        </li>
      </ol>
    </section>
  </main>
</template>

<style src="./SummaryView.css"></style>
