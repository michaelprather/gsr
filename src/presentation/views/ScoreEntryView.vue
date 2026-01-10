<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Game, Player, Round } from '@/domain'
import { RoundScore, validateRoundCompletion, validateScore } from '@/domain'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconUserSlashOutline,
} from '../components/icons'
import { UiButton, UiInput } from '../components/ui'
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

// Local form state for each player's score input
const scoreInputs = ref<Record<string, string>>({})
const scoreErrors = ref<Record<string, string | null>>({})

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

// Check if all players are skipped (for skip entire round)
const allPlayersSkipped = computed(() => {
  if (!game.value) return false
  return game.value.players.every((p) => isSkipped(p))
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

// Check if player is skipped for current round (either via skipFromRound OR round score)
function isSkipped(player: Player): boolean {
  // Check if player chose "skip rest of game" from a previous/current round
  if (player.isSkippedAt(currentRoundIndex.value)) {
    return true
  }

  // Check if round score is marked as skipped (single round skip)
  if (currentRound.value) {
    const score = currentRound.value.getScore(player.id)
    if (score && RoundScore.isSkipped(score)) {
      return true
    }
  }

  return false
}

// Check if player can be unskipped for this round
function canUnskip(player: Player): boolean {
  if (!currentRound.value) return false

  // If player skipFromRound is set and < currentRoundIndex, they can't unskip
  // (they chose to skip rest of game from a previous round)
  if (player.skipFromRound !== null && player.skipFromRound < currentRoundIndex.value) {
    return false
  }

  // Otherwise they can unskip (either single round skip, or they're on the round they chose to skip all)
  return isSkipped(player)
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

// Skip entire round handler (skip all players)
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
  } catch {
    // Error handling - could show toast
  }
}

function goToStandings() {
  router.push({ name: 'standings' })
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
        <h1 class="score-entry-view__round-type">
          {{ currentRound.type.displayName }}
          <IconCircleCheck
            v-if="isRoundComplete"
            class="score-entry-view__complete-icon"
            aria-label="Round complete"
          />
        </h1>
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

          <template v-if="isSkipped(player)">
            <div class="score-entry-view__player-skipped">
              <IconUserSlashOutline class="score-entry-view__skipped-icon" />
              <span>Skipped</span>
            </div>
            <UiButton
              v-if="canUnskip(player)"
              variant="secondary"
              size="small"
              block
              class="score-entry-view__unskip-button"
              @click="handleUnskip(player)"
            >
              Unskip
            </UiButton>
          </template>

          <template v-else>
            <div class="score-entry-view__score-row">
              <UiInput
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
              <UiButton
                variant="ghost"
                size="icon"
                aria-label="Skip player"
                @click="openSkipDialog(player)"
              >
                <IconUserSlashOutline />
              </UiButton>
            </div>
          </template>
        </div>
      </div>

      <div v-if="showWinnerHint" class="score-entry-view__hint" role="alert">
        One player must have a score of 0 (round winner)
      </div>
    </section>

    <footer class="score-entry-view__footer">
      <div class="score-entry-view__footer-actions">
        <UiButton
          v-if="!allPlayersSkipped"
          variant="secondary"
          @click="handleSkipEntireRound"
        >
          Skip Round
        </UiButton>
        <UiButton variant="primary" @click="goToStandings">Standings</UiButton>
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
  </main>
</template>

<style src="./ScoreEntryView.css"></style>
