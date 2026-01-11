<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Game, Player, Round } from '@/domain'
import {
  RoundScore,
  calculatePlayerTotals,
  findFirstInvalidRoundIndex,
  validateRoundCompletion,
} from '@/domain'
import {
  useGameService,
  useNewGame,
  useRoundScores,
  useSkipPlayer,
  useSwipe,
  useToast,
} from '../composables'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCrown,
  IconPlus,
  IconUserSlashOutline,
} from '../components/icons'
import { UiButton, UiConfirmDialog, UiInput } from '../components/ui'
import { AppBrand } from '../components/layout'
import { RoundPicker, SkipPlayerDialog } from '../components/domain'

const router = useRouter()
const service = useGameService()
const newGame = useNewGame()
const toast = useToast()

const game = ref<Game | null>(null)
const currentRoundIndex = ref(0)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const showRoundPicker = ref(false)
const showEndGameDialog = ref(false)

const currentRound = computed<Round | null>(() => {
  if (!game.value) return null
  return game.value.rounds[currentRoundIndex.value] ?? null
})

// Score management composable
const roundScores = useRoundScores({
  game,
  currentRound,
  currentRoundIndex,
  service,
  toast,
})

// Skip player composable
const skipPlayer = useSkipPlayer({
  game,
  currentRoundIndex,
  service,
  toast,
})

// Swipe navigation
const contentRef = ref<HTMLElement | null>(null)
useSwipe(contentRef, {
  onSwipeLeft: () => goNext(),
  onSwipeRight: () => goPrev(),
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
  return calculatePlayerTotals(game.value)
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
    const input = roundScores.scoreInputs.value[id]
    return input !== undefined && input !== ''
  })

  if (!allHaveValues) return false

  // Check if any player has 0
  const hasWinner = activePlayerIds.some((id) => {
    const input = roundScores.scoreInputs.value[id]
    return input === '0'
  })

  return !hasWinner
})

async function loadGame() {
  isLoading.value = true
  loadError.value = null
  try {
    const loadedGame = await service.loadGame()
    if (!loadedGame || loadedGame.isEnded) {
      router.replace({ name: 'setup' })
      return
    }
    game.value = loadedGame
    initializeRoundIndex()
    roundScores.initializeScoreInputs()
  } catch {
    loadError.value = 'Failed to load game'
  } finally {
    isLoading.value = false
  }
}

function goToSetup() {
  router.push({ name: 'setup' })
}

onMounted(() => {
  loadGame()
})

// Exception to "avoid watch()" convention: Score inputs are local form state that must
// be imperatively reset when navigating between rounds. This cannot be computed because
// the inputs need to be mutable for user editing while derived from persisted scores.
watch(currentRoundIndex, () => {
  roundScores.initializeScoreInputs()
})

function initializeRoundIndex() {
  if (!game.value) {
    currentRoundIndex.value = 0
    return
  }

  const invalidIndex = findFirstInvalidRoundIndex(game.value)
  if (invalidIndex >= 0) {
    currentRoundIndex.value = invalidIndex
  } else {
    // All rounds valid - go to last round
    currentRoundIndex.value = game.value.rounds.length - 1
  }
}

function goPrev() {
  if (canGoPrev.value) {
    currentRoundIndex.value--
  }
}

async function goNext() {
  if (!canGoNext.value) return
  if (!game.value || !currentRound.value) return

  // Save any unsaved scores before validating
  await roundScores.saveUnsavedScores()

  // Re-check current round after saves
  if (!currentRound.value) return

  const feedback = validateRoundCompletion(
    currentRound.value,
    currentRoundIndex.value,
    game.value.players,
  )

  if (feedback.hasFeedback) {
    const errors = feedback.get('round') ?? []
    errors.forEach((error) => toast.error(error))
    return
  }

  currentRoundIndex.value++
}

function selectRound(index: number) {
  currentRoundIndex.value = index
  showRoundPicker.value = false
}

async function handleMarkWinner(playerId: string) {
  if (!game.value) return

  const targetPlayer = game.value.players.find((p) => p.id.value === playerId)
  if (!targetPlayer) return

  try {
    // Unskip player if they are currently skipped
    if (isSkipped(targetPlayer)) {
      const updatedGame = await service.unskipPlayer(playerId, currentRoundIndex.value)
      game.value = updatedGame
    }

    // Clear any existing winner's score
    for (const player of game.value.players) {
      if (player.id.value !== playerId && roundScores.scoreInputs.value[player.id.value] === '0') {
        roundScores.scoreInputs.value[player.id.value] = ''
        const updatedGame = await service.clearScore(player.id.value, currentRoundIndex.value)
        game.value = updatedGame
      }
    }

    // Set new winner
    roundScores.scoreInputs.value[playerId] = '0'
    roundScores.scoreErrors.value[playerId] = null
    const updatedGame = await service.setScore(playerId, currentRoundIndex.value, 0)
    game.value = updatedGame
    roundScores.showSaveFeedback(playerId)
  } catch {
    roundScores.scoreErrors.value[playerId] = 'Failed to save score'
  }
}

function isWinner(player: Player): boolean {
  const inputValue = roundScores.scoreInputs.value[player.id.value]
  return inputValue === '0'
}

// Check if player is skipped for current round
function isSkipped(player: Player): boolean {
  if (!currentRound.value) return false
  const score = currentRound.value.getScore(player.id)
  return score !== undefined && RoundScore.isSkipped(score)
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
    toast.error('Failed to skip round')
  }
}

function goToStandings() {
  router.push({ name: 'standings' })
}

async function handleEndGame() {
  try {
    await service.endGame()
    showEndGameDialog.value = false
    router.push({ name: 'standings', query: { celebrate: 'true' } })
  } catch {
    toast.error('Failed to end game')
  }
}
</script>

<template>
  <div v-if="isLoading" class="score-entry-view__loading">Loading...</div>

  <div v-else-if="loadError" class="score-entry-view__error">
    <p class="score-entry-view__error-message">{{ loadError }}</p>
    <div class="score-entry-view__error-actions">
      <UiButton variant="secondary" @click="loadGame">Try Again</UiButton>
      <UiButton @click="goToSetup">Start New Game</UiButton>
    </div>
  </div>

  <main v-else-if="game && currentRound" class="score-entry-view">
    <header class="score-entry-view__header">
      <div class="score-entry-view__title-bar">
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
            {
              'score-entry-view__player-card--saved': roundScores.recentlySaved.value.has(
                player.id.value,
              ),
            },
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
              v-model="roundScores.scoreInputs.value[player.id.value]"
              :label="`Score for ${player.name}`"
              :hide-label="true"
              type="number"
              inputmode="numeric"
              placeholder="—"
              :step="5"
              :error="roundScores.scoreErrors.value[player.id.value]"
              :center="true"
              @blur="roundScores.handleScoreBlur(player.id.value)"
            />
            <div v-else class="score-entry-view__skipped-placeholder">—</div>
            <UiButton
              variant="ghost"
              size="icon"
              :class="{ 'score-entry-view__winner-button--active': isWinner(player) }"
              aria-label="Mark as round winner"
              title="Mark as round winner"
              @click="handleMarkWinner(player.id.value)"
            >
              <IconCrown />
            </UiButton>
            <UiButton
              variant="ghost"
              size="icon"
              :class="{ 'score-entry-view__skip-button--active': isSkipped(player) }"
              :aria-label="isSkipped(player) ? 'Unskip player' : 'Skip player'"
              @click="isSkipped(player) ? skipPlayer.unskip(player) : skipPlayer.openDialog(player)"
            >
              <IconUserSlashOutline />
            </UiButton>
          </div>
        </div>
      </div>

      <div v-if="showWinnerHint" class="score-entry-view__hint" role="alert">
        One player must have a score of 0 (round winner)
      </div>
    </section>

    <footer class="score-entry-view__footer">
      <div class="score-entry-view__footer-actions">
        <UiButton variant="secondary" @click="handleSkipEntireRound"> Skip Round </UiButton>
        <UiButton v-if="canEndGame" variant="primary" @click="showEndGameDialog = true">
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
      :open="skipPlayer.showDialog.value"
      :player-name="skipPlayer.targetPlayer.value?.name ?? ''"
      @skip-round="skipPlayer.skipRound"
      @skip-all="skipPlayer.skipAll"
      @close="skipPlayer.closeDialog"
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

<style src="./ScoreEntryView.css"></style>
