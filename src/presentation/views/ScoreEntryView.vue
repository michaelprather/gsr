<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Game, Player, Round } from '@/domain'
import { RoundScore, validateRoundCompletion, validateScore } from '@/domain'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { useSwipe } from '../composables'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconPlus,
  IconUserSlashOutline,
} from '../components/icons'
import { UiButton, UiConfirmDialog, UiInput } from '../components/ui'
import { RoundPicker, SkipPlayerDialog } from '../components/domain'

const router = useRouter()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const game = ref<Game | null>(null)
const currentRoundIndex = ref(0)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const showRoundPicker = ref(false)

// Skip dialog state
const showSkipDialog = ref(false)
const skipTargetPlayer = ref<Player | null>(null)

// End game dialog state
const showEndGameDialog = ref(false)

// New game dialog state
const showNewGameDialog = ref(false)

// Swipe navigation
const contentRef = ref<HTMLElement | null>(null)
useSwipe(contentRef, {
  onSwipeLeft: () => goNext(),
  onSwipeRight: () => goPrev(),
})

// Local form state for each player's score input
const scoreInputs = ref<Record<string, string>>({})
const scoreErrors = ref<Record<string, string | null>>({})
const recentlySaved = ref<Set<string>>(new Set())

const currentRound = computed<Round | null>(() => {
  if (!game.value) return null
  return game.value.rounds[currentRoundIndex.value] ?? null
})

const canGoPrev = computed(() => currentRoundIndex.value > 0)
const canGoNext = computed(() => {
  if (!game.value) return false
  return currentRoundIndex.value < game.value.rounds.length - 1
})

// Check if current round is complete (all scores entered + one winner)
const isRoundComplete = computed(() => {
  if (!game.value || !currentRound.value) return false
  const feedback = validateRoundCompletion(
    currentRound.value,
    currentRoundIndex.value,
    game.value.players,
  )
  return !feedback.hasFeedback
})

// Round validation errors for display
const roundValidationErrors = ref<string[]>([])

// Check if all rounds are complete (for end game)
const allRoundsComplete = computed(() => {
  if (!game.value) return false
  for (let i = 0; i < game.value.rounds.length; i++) {
    const round = game.value.rounds[i]
    if (!round) return false
    const feedback = validateRoundCompletion(round, i, game.value.players)
    if (feedback.hasFeedback) return false
  }
  return true
})

// On last round and ready to end game
const canEndGame = computed(() => {
  if (!game.value) return false
  const isLastRound = currentRoundIndex.value === game.value.rounds.length - 1
  return isLastRound && allRoundsComplete.value
})

// Calculate cumulative totals for each player
const playerTotals = computed<Record<string, number>>(() => {
  if (!game.value) return {}

  const totals: Record<string, number> = {}

  for (const player of game.value.players) {
    let total = 0
    for (const round of game.value.rounds) {
      const score = round.getScore(player.id)
      if (score && RoundScore.isEntered(score)) {
        total += score.value.value
      }
    }
    totals[player.id.value] = total
  }

  return totals
})

// Get active (non-skipped) players for the current round
const activePlayers = computed<Player[]>(() => {
  if (!game.value) return []
  return game.value.players.filter((p) => !isSkipped(p))
})

// Check if we should show the "winner required" hint
const showWinnerHint = computed(() => {
  if (!currentRound.value) return false

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

// When round changes, re-initialize score inputs and clear errors
watch(currentRoundIndex, () => {
  initializeScoreInputs()
  roundValidationErrors.value = []
})

function initializeRoundIndex() {
  // Start at round 0
  currentRoundIndex.value = 0
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
    roundValidationErrors.value = []
    currentRoundIndex.value--
  }
}

async function saveUnsavedScores(): Promise<void> {
  if (!game.value || !currentRound.value) return

  for (const player of game.value.players) {
    if (isSkipped(player)) continue

    const inputValue = scoreInputs.value[player.id.value]
    if (inputValue === '' || inputValue === undefined) continue

    const numericValue = parseInt(inputValue, 10)
    if (isNaN(numericValue)) continue

    const feedback = validateScore(numericValue)
    if (feedback.hasFeedback) continue

    // Check if score differs from persisted value
    const currentScore = currentRound.value.getScore(player.id)
    const persistedValue = currentScore && RoundScore.isEntered(currentScore)
      ? currentScore.value.value
      : null

    if (persistedValue !== numericValue) {
      try {
        const updatedGame = await service.setScore(player.id.value, currentRoundIndex.value, numericValue)
        game.value = updatedGame
      } catch {
        // Ignore save errors here - validation will catch issues
      }
    }
  }
}

async function goNext() {
  if (!canGoNext.value) return
  if (!game.value || !currentRound.value) return

  // Save any unsaved scores before validating
  await saveUnsavedScores()

  // Re-check current round after saves
  if (!currentRound.value) return

  const feedback = validateRoundCompletion(
    currentRound.value,
    currentRoundIndex.value,
    game.value.players,
  )

  if (feedback.hasFeedback) {
    roundValidationErrors.value = [...(feedback.get('round') ?? [])]
    return
  }

  roundValidationErrors.value = []
  currentRoundIndex.value++
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
    showSaveFeedback(playerId)
  } catch {
    scoreErrors.value[playerId] = 'Failed to save score'
  }
}

function showSaveFeedback(playerId: string) {
  recentlySaved.value.add(playerId)
  setTimeout(() => {
    recentlySaved.value.delete(playerId)
  }, 300)
}

// Check if player is skipped for current round
function isSkipped(player: Player): boolean {
  if (!currentRound.value) return false
  const score = currentRound.value.getScore(player.id)
  return score !== undefined && RoundScore.isSkipped(score)
}

// Open skip dialog for a player
function openSkipDialog(player: Player) {
  skipTargetPlayer.value = player
  showSkipDialog.value = true
}

function closeSkipDialog() {
  showSkipDialog.value = false
  skipTargetPlayer.value = null
}

async function handleSkipRound() {
  if (!skipTargetPlayer.value) return

  try {
    const updatedGame = await service.skipPlayer(
      skipTargetPlayer.value.id.value,
      currentRoundIndex.value,
      false,
    )
    game.value = updatedGame
    closeSkipDialog()
  } catch {
    // Error handling - could show toast
  }
}

async function handleSkipAll() {
  if (!skipTargetPlayer.value) return

  try {
    const updatedGame = await service.skipPlayer(
      skipTargetPlayer.value.id.value,
      currentRoundIndex.value,
      true,
    )
    game.value = updatedGame
    closeSkipDialog()
  } catch {
    // Error handling - could show toast
  }
}

async function handleUnskip(player: Player) {
  try {
    const updatedGame = await service.unskipPlayer(player.id.value, currentRoundIndex.value)
    game.value = updatedGame
  } catch {
    // Error handling - could show toast
  }
}

// Skip entire round handler (skip all players and proceed)
async function handleSkipEntireRound() {
  if (!game.value) return

  try {
    // Skip all non-skipped players for this round
    let updatedGame = game.value
    for (const player of game.value.players) {
      if (!isSkipped(player)) {
        updatedGame = await service.skipPlayer(player.id.value, currentRoundIndex.value, false)
      }
    }
    game.value = updatedGame

    // Proceed to next round if available
    if (canGoNext.value) {
      currentRoundIndex.value++
    }
  } catch {
    // Error handling - could show toast
  }
}

function goToStandings() {
  router.push({ name: 'standings' })
}

async function handleEndGame() {
  try {
    await service.endGame()
    showEndGameDialog.value = false
    router.push({ name: 'standings' })
  } catch {
    // Error handling - could show toast
  }
}

async function handleNewGame() {
  try {
    await service.clearGame()
    showNewGameDialog.value = false
    router.push({ name: 'setup' })
  } catch {
    // Error handling - could show toast
  }
}

function openNewGameDialog() {
  showNewGameDialog.value = true
}
</script>

<template>
  <div v-if="isLoading" class="score-entry-view__loading">Loading...</div>

  <div v-else-if="loadError" class="score-entry-view__error">{{ loadError }}</div>

  <main v-else-if="game && currentRound" class="score-entry-view">
    <header class="score-entry-view__header">
      <div class="score-entry-view__title-bar">
        <span class="score-entry-view__game-name">George Street Rummy</span>
        <UiButton
          variant="ghost"
          size="icon"
          aria-label="New game"
          title="New game"
          @click="openNewGameDialog"
        >
          <IconPlus />
        </UiButton>
      </div>

      <div class="score-entry-view__nav">
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
          <div class="score-entry-view__round-type">
            <h1 class="score-entry-view__round-name">
              {{ currentRound.type.displayName }}
            </h1>
            <IconCircleCheck
              v-if="isRoundComplete"
              class="score-entry-view__complete-icon"
              aria-label="Round complete"
            />
          </div>
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
      </div>
    </header>

    <section ref="contentRef" class="score-entry-view__content">
      <div class="score-entry-view__player-list">
        <div
          v-for="player in game.players"
          :key="player.id.value"
          :class="[
            'score-entry-view__player-card',
            { 'score-entry-view__player-card--saved': recentlySaved.has(player.id.value) }
          ]"
        >
          <div class="score-entry-view__player-header">
            <span class="score-entry-view__player-name">{{ player.name }}</span>
            <span class="score-entry-view__player-total">
              Total: {{ playerTotals[player.id.value] ?? 0 }}
            </span>
          </div>

          <div class="score-entry-view__score-row">
            <UiInput
              v-if="!isSkipped(player)"
              v-model="scoreInputs[player.id.value]"
              :label="`Score for ${player.name}`"
              :hide-label="true"
              type="number"
              inputmode="numeric"
              placeholder="—"
              :step="5"
              :error="scoreErrors[player.id.value]"
              :center="true"
              @blur="handleScoreBlur(player.id.value)"
            />
            <div v-else class="score-entry-view__skipped-placeholder">—</div>
            <UiButton
              variant="ghost"
              size="icon"
              :class="{ 'score-entry-view__skip-button--active': isSkipped(player) }"
              :aria-label="isSkipped(player) ? 'Unskip player' : 'Skip player'"
              @click="isSkipped(player) ? handleUnskip(player) : openSkipDialog(player)"
            >
              <IconUserSlashOutline />
            </UiButton>
          </div>
        </div>
      </div>

      <div v-if="showWinnerHint && roundValidationErrors.length === 0" class="score-entry-view__hint" role="alert">
        One player must have a score of 0 (round winner)
      </div>

      <div v-if="roundValidationErrors.length > 0" class="score-entry-view__errors" role="alert">
        <p v-for="(error, i) in roundValidationErrors" :key="i">{{ error }}</p>
      </div>
    </section>

    <footer class="score-entry-view__footer">
      <div class="score-entry-view__footer-actions">
        <UiButton
          variant="secondary"
          @click="handleSkipEntireRound"
        >
          Skip Round
        </UiButton>
        <UiButton
          v-if="canEndGame"
          variant="primary"
          @click="showEndGameDialog = true"
        >
          End Game
        </UiButton>
        <UiButton v-else variant="primary" @click="goToStandings">Standings</UiButton>
      </div>
    </footer>

    <RoundPicker
      :open="showRoundPicker"
      :rounds="game.rounds"
      :players="game.players"
      :current-index="currentRoundIndex"
      @select="selectRound"
      @close="showRoundPicker = false"
    />

    <SkipPlayerDialog
      :open="showSkipDialog"
      :player-name="skipTargetPlayer?.name ?? ''"
      @skip-round="handleSkipRound"
      @skip-all="handleSkipAll"
      @close="closeSkipDialog"
    />

    <UiConfirmDialog
      :open="showEndGameDialog"
      title="End Game"
      message="End the game and see final results?"
      confirm-label="End Game"
      @confirm="handleEndGame"
      @cancel="showEndGameDialog = false"
    />

    <UiConfirmDialog
      :open="showNewGameDialog"
      title="Start New Game"
      message="This will end your current game. All scores will be lost."
      confirm-label="New Game"
      :destructive="true"
      @confirm="handleNewGame"
      @cancel="showNewGameDialog = false"
    />
  </main>
</template>

<style src="./ScoreEntryView.css"></style>
