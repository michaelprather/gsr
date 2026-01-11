<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Game } from '@/domain'
import { calculatePlayerStats, PlayerId } from '@/domain'
import type { PlayerStats } from '@/domain'
import { useGameService, useNewGame } from '../composables'
import { IconChevronLeft, IconPlus, IconTrophy } from '../components/icons'
import { UiButton, UiConfirmDialog } from '../components/ui'
import { AppBrand } from '../components/layout'

const router = useRouter()
const route = useRoute()
const service = useGameService()
const newGame = useNewGame()

const game = ref<Game | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const playerId = computed(() => {
  const id = route.params.id
  if (typeof id !== 'string' || !id) return null
  try {
    return PlayerId.create(id)
  } catch {
    return null
  }
})

const stats = computed<PlayerStats | null>(() => {
  if (!game.value || !playerId.value) return null
  return calculatePlayerStats(game.value, playerId.value)
})

const formattedWinRate = computed(() => {
  if (!stats.value) return '0%'
  return `${Math.round(stats.value.winRate * 100)}%`
})

const formattedAverageScore = computed(() => {
  if (!stats.value || stats.value.roundsPlayed === 0) return '-'
  return stats.value.averageScore.toFixed(1)
})

async function loadGame() {
  isLoading.value = true
  loadError.value = null
  try {
    const loadedGame = await service.loadGame()
    if (!loadedGame) {
      router.replace({ name: 'setup' })
      return
    }
    game.value = loadedGame

    if (!playerId.value) {
      router.replace({ name: 'standings' })
    }
  } catch {
    loadError.value = 'Failed to load game'
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push({ name: 'standings' })
}

onMounted(() => {
  loadGame()
})
</script>

<template>
  <div v-if="isLoading" class="player-view__loading">Loading...</div>

  <div v-else-if="loadError" class="player-view__error">
    <p class="player-view__error-message">{{ loadError }}</p>
    <UiButton variant="secondary" @click="loadGame">Try Again</UiButton>
  </div>

  <main v-else-if="stats" class="player-view">
    <header class="player-view__header">
      <div class="player-view__title-bar">
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

      <div class="player-view__nav">
        <UiButton variant="ghost" size="icon" aria-label="Back to standings" @click="goBack">
          <IconChevronLeft />
        </UiButton>

        <div class="player-view__title-area">
          <h1 class="player-view__title">{{ stats.playerName }}</h1>
          <span class="player-view__subtitle">Player Stats</span>
        </div>

        <div class="player-view__spacer" />
      </div>
    </header>

    <section class="player-view__content">
      <div class="player-view__summary">
        <div class="player-view__stat-card player-view__stat-card--primary">
          <span class="player-view__stat-value">{{ stats.totalScore }}</span>
          <span class="player-view__stat-label">Total Score</span>
        </div>

        <div class="player-view__stat-grid">
          <div class="player-view__stat-card">
            <span class="player-view__stat-value">{{ stats.roundsWon }}</span>
            <span class="player-view__stat-label">Rounds Won</span>
          </div>

          <div class="player-view__stat-card">
            <span class="player-view__stat-value">{{ formattedWinRate }}</span>
            <span class="player-view__stat-label">Win Rate</span>
          </div>

          <div class="player-view__stat-card">
            <span class="player-view__stat-value">{{ formattedAverageScore }}</span>
            <span class="player-view__stat-label">Avg Score</span>
          </div>

          <div class="player-view__stat-card">
            <span class="player-view__stat-value">{{ stats.roundsPlayed }}</span>
            <span class="player-view__stat-label">Rounds Played</span>
          </div>
        </div>
      </div>

      <div v-if="stats.bestRound || stats.worstRound" class="player-view__highlights">
        <h2 class="player-view__section-title">Highlights</h2>

        <div class="player-view__highlight-cards">
          <div v-if="stats.bestRound" class="player-view__highlight-card">
            <span class="player-view__highlight-label">Best Round</span>
            <span class="player-view__highlight-round">{{ stats.bestRound.roundName }}</span>
            <span class="player-view__highlight-score player-view__highlight-score--best">
              <template v-if="stats.bestRound.isWin">
                <IconTrophy class="player-view__win-icon" />
                Win
              </template>
              <template v-else>{{ stats.bestRound.score }}</template>
            </span>
          </div>

          <div v-if="stats.worstRound" class="player-view__highlight-card">
            <span class="player-view__highlight-label">Worst Round</span>
            <span class="player-view__highlight-round">{{ stats.worstRound.roundName }}</span>
            <span class="player-view__highlight-score player-view__highlight-score--worst">
              {{ stats.worstRound.score }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="stats.roundResults.length > 0" class="player-view__rounds">
        <h2 class="player-view__section-title">Round by Round</h2>

        <ol class="player-view__round-list">
          <li
            v-for="result in stats.roundResults"
            :key="result.roundIndex"
            class="player-view__round-item"
            :class="{ 'player-view__round-item--win': result.isWin }"
          >
            <span class="player-view__round-number">{{ result.roundIndex + 1 }}</span>
            <span class="player-view__round-name">{{ result.roundName }}</span>
            <span class="player-view__round-score">
              <template v-if="result.isWin">
                <IconTrophy class="player-view__win-icon" />
                Win
              </template>
              <template v-else>{{ result.score }}</template>
            </span>
          </li>
        </ol>
      </div>

      <div v-if="stats.roundsSkipped > 0" class="player-view__skipped-notice">
        {{ stats.roundsSkipped }} round{{ stats.roundsSkipped > 1 ? 's' : '' }} skipped
      </div>
    </section>

    <UiConfirmDialog
      :open="newGame.showDialog.value"
      title="Start New Game"
      message="This will end your current game. All scores will be lost."
      confirm-label="New Game"
      :destructive="true"
      @confirm="newGame.confirm"
      @cancel="newGame.closeDialog"
    />
  </main>
</template>

<style src="./PlayerView.css"></style>
