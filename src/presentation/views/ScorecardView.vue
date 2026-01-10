<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Game, Player, Round } from '@/domain'
import { RoundScore, validateRoundCompletion } from '@/domain'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { IconChevronLeft } from '../components/icons'
import { UiButton } from '../components/ui'

const router = useRouter()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const game = ref<Game | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const expandedRoundIndex = ref<number | null>(null)

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

function getPlayerTotal(player: Player): number {
  if (!game.value) return 0

  let total = 0
  for (const round of game.value.rounds) {
    const score = round.getScore(player.id)
    if (score && RoundScore.isEntered(score)) {
      total += score.value.value
    }
  }
  return total
}

function getCellDisplay(round: Round, player: Player): string {
  const score = round.getScore(player.id)

  if (!score || RoundScore.isPending(score)) {
    return ''
  }

  if (RoundScore.isSkipped(score)) {
    return '—'
  }

  if (RoundScore.isEntered(score)) {
    return String(score.value.value)
  }

  return ''
}

function isWinner(round: Round, player: Player): boolean {
  const score = round.getScore(player.id)
  return score !== undefined && RoundScore.isEntered(score) && score.value.value === 0
}

function isSkipped(round: Round, player: Player): boolean {
  const score = round.getScore(player.id)
  return score !== undefined && RoundScore.isSkipped(score)
}

function toggleRoundExpanded(index: number) {
  if (expandedRoundIndex.value === index) {
    expandedRoundIndex.value = null
  } else {
    expandedRoundIndex.value = index
  }
}

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

function goToSummary() {
  router.push({ name: 'summary' })
}
</script>

<template>
  <div v-if="isLoading" class="scorecard-view__loading">Loading...</div>

  <div v-else-if="loadError" class="scorecard-view__error">{{ loadError }}</div>

  <main v-else-if="game" class="scorecard-view">
    <header class="scorecard-view__header">
      <UiButton variant="ghost" size="icon" aria-label="Back to score entry" @click="goBack">
        <IconChevronLeft />
      </UiButton>

      <div class="scorecard-view__title-area">
        <h1 class="scorecard-view__title">Scorecard</h1>
        <span class="scorecard-view__round-indicator">
          Round {{ currentRoundNumber }} of {{ totalRounds }}
        </span>
      </div>

      <div class="scorecard-view__spacer" />
    </header>

    <section class="scorecard-view__content">
      <div class="scorecard-view__table-wrapper">
        <table class="scorecard-view__table">
          <thead>
            <tr>
              <th class="scorecard-view__player-header">Player</th>
              <th
                v-for="(round, index) in game.rounds"
                :key="index"
                class="scorecard-view__round-header"
                :class="{ 'scorecard-view__round-header--expanded': expandedRoundIndex === index }"
                @click="toggleRoundExpanded(index)"
              >
                <span class="scorecard-view__round-abbr">{{ round.type.abbreviation }}</span>
                <span
                  v-if="expandedRoundIndex === index"
                  class="scorecard-view__round-full"
                >
                  {{ round.type.displayName }}
                </span>
              </th>
              <th class="scorecard-view__total-header">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in game.players" :key="player.id.value">
              <td class="scorecard-view__player-cell">{{ player.name }}</td>
              <td
                v-for="(round, index) in game.rounds"
                :key="index"
                class="scorecard-view__score-cell"
                :class="{
                  'scorecard-view__score-cell--winner': isWinner(round, player),
                  'scorecard-view__score-cell--skipped': isSkipped(round, player),
                }"
              >
                {{ getCellDisplay(round, player) }}
              </td>
              <td class="scorecard-view__total-cell">{{ getPlayerTotal(player) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <footer class="scorecard-view__footer">
      <nav class="scorecard-view__view-toggle">
        <button
          type="button"
          class="scorecard-view__view-toggle-item"
          @click="goToSummary"
        >
          Standings
        </button>
        <span class="scorecard-view__view-toggle-item scorecard-view__view-toggle-item--active">
          Scorecard
        </span>
      </nav>
    </footer>
  </main>
</template>

<style src="./ScorecardView.css"></style>
