<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Game, Player, Round } from '@/domain'
import { RoundScore, validateScore } from '@/domain'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { IconChevronLeft, IconChevronRight } from '../components/icons'
import { UiButton, UiInput } from '../components/ui'
import { RoundPicker } from '../components/domain'

const router = useRouter()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const game = ref<Game | null>(null)
const currentRoundIndex = ref(0)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const showRoundPicker = ref(false)

// Local form state for each player's score input
const scoreInputs = ref<Record<string, string>>({})
const scoreErrors = ref<Record<string, string | null>>({})

const currentRound = computed<Round | null>(() => {
  if (!game.value) return null
  return game.value.rounds[currentRoundIndex.value] ?? null
})

const activePlayers = computed<Player[]>(() => {
  if (!game.value) return []
  return game.value.players.filter((p) => !p.isSkippedAt(currentRoundIndex.value))
})

const canGoPrev = computed(() => currentRoundIndex.value > 0)
const canGoNext = computed(() => {
  if (!game.value) return false
  return currentRoundIndex.value < game.value.rounds.length - 1
})

// Calculate cumulative totals for each player (locked rounds only)
const playerTotals = computed<Record<string, number>>(() => {
  if (!game.value) return {}

  const totals: Record<string, number> = {}

  for (const player of game.value.players) {
    let total = 0
    for (const round of game.value.rounds) {
      if (!round.isLocked) continue
      const score = round.getScore(player.id)
      if (score && RoundScore.isEntered(score)) {
        total += score.value.value
      }
    }
    totals[player.id.value] = total
  }

  return totals
})

// Check if we should show the "winner required" hint
const showWinnerHint = computed(() => {
  if (!currentRound.value || currentRound.value.isLocked) return false

  const activePlayerIds = activePlayers.value.map((p) => p.id.value)
  if (activePlayerIds.length === 0) return false

  // Check if all active players have entered values
  const allHaveValues = activePlayerIds.every((id) => {
    const input = scoreInputs.value[id]
    return input !== undefined && input !== ''
  })

  if (!allHaveValues) return false

  // Check if any player has 0
  const hasWinner = activePlayerIds.some((id) => {
    const input = scoreInputs.value[id]
    return input === '0'
  })

  return !hasWinner
})

onMounted(async () => {
  try {
    const loadedGame = await service.loadGame()
    if (!loadedGame || loadedGame.isEnded) {
      router.replace({ name: 'setup' })
      return
    }
    game.value = loadedGame
    initializeRoundIndex()
    initializeScoreInputs()
  } catch {
    loadError.value = 'Failed to load game'
  } finally {
    isLoading.value = false
  }
})

// When round changes, re-initialize score inputs
watch(currentRoundIndex, () => {
  initializeScoreInputs()
})

function initializeRoundIndex() {
  if (!game.value) return

  // Find first unlocked round, or stay at 0
  const firstUnlockedIndex = game.value.rounds.findIndex((r) => !r.isLocked)
  if (firstUnlockedIndex !== -1) {
    currentRoundIndex.value = firstUnlockedIndex
  }
}

function initializeScoreInputs() {
  if (!game.value || !currentRound.value) return

  const inputs: Record<string, string> = {}
  const errors: Record<string, string | null> = {}

  for (const player of game.value.players) {
    const score = currentRound.value.getScore(player.id)
    if (score && RoundScore.isEntered(score)) {
      inputs[player.id.value] = String(score.value.value)
    } else {
      inputs[player.id.value] = ''
    }
    errors[player.id.value] = null
  }

  scoreInputs.value = inputs
  scoreErrors.value = errors
}

function goPrev() {
  if (canGoPrev.value) {
    currentRoundIndex.value--
  }
}

function goNext() {
  if (canGoNext.value) {
    currentRoundIndex.value++
  }
}

function selectRound(index: number) {
  currentRoundIndex.value = index
  showRoundPicker.value = false
}

async function handleScoreBlur(playerId: string) {
  const inputValue = scoreInputs.value[playerId]

  // Clear error first
  scoreErrors.value[playerId] = null

  // Empty input is valid (just means no score entered yet)
  if (inputValue === '' || inputValue === undefined) {
    return
  }

  const numericValue = parseInt(inputValue, 10)

  // Validate
  if (isNaN(numericValue)) {
    scoreErrors.value[playerId] = 'Enter a valid number'
    return
  }

  const feedback = validateScore(numericValue)
  if (feedback.hasFeedback) {
    scoreErrors.value[playerId] = feedback.get('score')?.[0] ?? 'Invalid score'
    return
  }

  // Save to service
  try {
    const updatedGame = await service.setScore(playerId, currentRoundIndex.value, numericValue)
    game.value = updatedGame
  } catch {
    scoreErrors.value[playerId] = 'Failed to save score'
  }
}

function isSkipped(player: Player): boolean {
  return player.isSkippedAt(currentRoundIndex.value)
}
</script>

<template>
  <div v-if="isLoading" class="score-entry-view__loading">Loading...</div>

  <div v-else-if="loadError" class="score-entry-view__error">{{ loadError }}</div>

  <main v-else-if="game && currentRound" class="score-entry-view">
    <header class="score-entry-view__header">
      <UiButton
        variant="ghost"
        size="icon"
        :disabled="!canGoPrev"
        aria-label="Previous round"
        @click="goPrev"
      >
        <IconChevronLeft />
      </UiButton>

      <div class="score-entry-view__round-info">
        <h1 class="score-entry-view__round-type">{{ currentRound.type.displayName }}</h1>
        <button
          type="button"
          class="score-entry-view__round-indicator"
          aria-label="Select round"
          @click="showRoundPicker = true"
        >
          Round {{ currentRoundIndex + 1 }} of {{ game.rounds.length }}
        </button>
      </div>

      <UiButton
        variant="ghost"
        size="icon"
        :disabled="!canGoNext"
        aria-label="Next round"
        @click="goNext"
      >
        <IconChevronRight />
      </UiButton>
    </header>

    <section class="score-entry-view__content">
      <div class="score-entry-view__player-list">
        <div
          v-for="player in game.players"
          :key="player.id.value"
          class="score-entry-view__player-card"
        >
          <div class="score-entry-view__player-header">
            <span class="score-entry-view__player-name">{{ player.name }}</span>
            <span class="score-entry-view__player-total">
              Total: {{ playerTotals[player.id.value] ?? 0 }}
            </span>
          </div>

          <div v-if="isSkipped(player)" class="score-entry-view__player-skipped">Skipped</div>

          <UiInput
            v-else
            v-model="scoreInputs[player.id.value]"
            :label="`Score for ${player.name}`"
            :hide-label="true"
            type="number"
            inputmode="numeric"
            placeholder="—"
            :disabled="currentRound.isLocked"
            :error="scoreErrors[player.id.value]"
            :center="true"
            @blur="handleScoreBlur(player.id.value)"
          />
        </div>
      </div>

      <div v-if="showWinnerHint" class="score-entry-view__hint" role="alert">
        One player must have a score of 0 (round winner)
      </div>
    </section>

    <RoundPicker
      :open="showRoundPicker"
      :rounds="game.rounds"
      :current-index="currentRoundIndex"
      @select="selectRound"
      @close="showRoundPicker = false"
    />
  </main>
</template>

<style src="./ScoreEntryView.css"></style>
