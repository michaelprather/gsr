import { ref, type Ref, type ComputedRef } from 'vue'
import type { Game, Player, Round } from '@/domain'
import { RoundScore, validateScore } from '@/domain'
import type { GameService } from '@/application'
import type { UseToastReturn } from './useToast'

export interface UseRoundScoresOptions {
  game: Ref<Game | null>
  currentRound: ComputedRef<Round | null>
  currentRoundIndex: Ref<number>
  service: GameService
  toast: UseToastReturn
}

export interface UseRoundScoresReturn {
  scoreInputs: Ref<Record<string, string>>
  scoreErrors: Ref<Record<string, string | null>>
  recentlySaved: Ref<Set<string>>
  initializeScoreInputs: () => void
  handleScoreBlur: (playerId: string) => Promise<void>
  saveUnsavedScores: () => Promise<void>
  showSaveFeedback: (playerId: string) => void
}

export function useRoundScores(options: UseRoundScoresOptions): UseRoundScoresReturn {
  const { game, currentRound, currentRoundIndex, service, toast } = options

  const scoreInputs = ref<Record<string, string>>({})
  const scoreErrors = ref<Record<string, string | null>>({})
  const recentlySaved = ref<Set<string>>(new Set())

  function initializeScoreInputs(): void {
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

  function showSaveFeedback(playerId: string): void {
    recentlySaved.value.add(playerId)
    setTimeout(() => {
      recentlySaved.value.delete(playerId)
    }, 300)
  }

  function isSkipped(player: Player): boolean {
    if (!currentRound.value) return false
    const score = currentRound.value.getScore(player.id)
    return score !== undefined && RoundScore.isSkipped(score)
  }

  async function handleScoreBlur(playerId: string): Promise<void> {
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
      const persistedValue =
        currentScore && RoundScore.isEntered(currentScore) ? currentScore.value.value : null

      if (persistedValue !== numericValue) {
        try {
          const updatedGame = await service.setScore(
            player.id.value,
            currentRoundIndex.value,
            numericValue,
          )
          game.value = updatedGame
        } catch {
          toast.error('Failed to save score')
        }
      }
    }
  }

  return {
    scoreInputs,
    scoreErrors,
    recentlySaved,
    initializeScoreInputs,
    handleScoreBlur,
    saveUnsavedScores,
    showSaveFeedback,
  }
}
