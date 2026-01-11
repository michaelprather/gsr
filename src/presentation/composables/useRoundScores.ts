import { ref, type Ref, type ComputedRef } from 'vue'
import type { Game, Round } from '@/domain'
import { PlayerId, RoundScore } from '@/domain'
import type { GameService } from '@/application'
import type { UseToastReturn } from './useToast'

const MIN_SCORE = 0
const MAX_SCORE = 300
const SCORE_INCREMENT = 5

export interface UseRoundScoresOptions {
  game: Ref<Game | null>
  currentRound: ComputedRef<Round | null>
  currentRoundIndex: Ref<number>
  service: GameService
  toast: UseToastReturn
}

export interface UseRoundScoresReturn {
  scoreInputs: Ref<Record<string, string>>
  recentlySaved: Ref<Set<string>>
  initializeScoreInputs: () => void
  handleScoreBlur: (playerId: string) => Promise<void>
  saveUnsavedScores: () => Promise<void>
  showSaveFeedback: (playerId: string) => void
}

export function useRoundScores(options: UseRoundScoresOptions): UseRoundScoresReturn {
  const { game, currentRound, currentRoundIndex, service, toast } = options

  const scoreInputs = ref<Record<string, string>>({})
  const recentlySaved = ref<Set<string>>(new Set())

  function initializeScoreInputs(): void {
    if (!game.value || !currentRound.value) return

    const inputs: Record<string, string> = {}

    for (const player of game.value.players) {
      const score = currentRound.value.getScore(player.id)
      if (score && RoundScore.isEntered(score)) {
        inputs[player.id.value] = String(score.value.value)
      } else {
        inputs[player.id.value] = ''
      }
    }

    scoreInputs.value = inputs
  }

  function normalizeScore(value: number): number {
    const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, value))
    return Math.round(clamped / SCORE_INCREMENT) * SCORE_INCREMENT
  }

  function showSaveFeedback(playerId: string): void {
    recentlySaved.value.add(playerId)
    setTimeout(() => {
      recentlySaved.value.delete(playerId)
    }, 300)
  }

  async function handleScoreBlur(playerId: string): Promise<void> {
    if (!currentRound.value) return

    const inputValue = scoreInputs.value[playerId]
    const currentScore = currentRound.value.getScore(PlayerId.create(playerId))
    const hadEnteredScore = currentScore && RoundScore.isEntered(currentScore)

    // Empty input - clear score if previously entered
    if (inputValue === '' || inputValue === undefined) {
      if (hadEnteredScore) {
        try {
          const updatedGame = await service.clearScore(playerId, currentRoundIndex.value)
          game.value = updatedGame
        } catch {
          toast.error('Failed to clear score')
        }
      }
      return
    }

    const numericValue = parseInt(inputValue, 10)

    // Non-numeric input - clear it and persist if needed
    if (isNaN(numericValue)) {
      scoreInputs.value[playerId] = ''
      if (hadEnteredScore) {
        try {
          const updatedGame = await service.clearScore(playerId, currentRoundIndex.value)
          game.value = updatedGame
        } catch {
          toast.error('Failed to clear score')
        }
      }
      return
    }

    // Normalize the score (clamp and round to increment)
    const normalizedValue = normalizeScore(numericValue)
    scoreInputs.value[playerId] = String(normalizedValue)

    // Save to service
    try {
      const updatedGame = await service.setScore(playerId, currentRoundIndex.value, normalizedValue)
      game.value = updatedGame
      showSaveFeedback(playerId)
    } catch {
      toast.error('Failed to save score')
    }
  }

  async function saveUnsavedScores(): Promise<void> {
    if (!game.value || !currentRound.value) return

    for (const player of game.value.players) {
      const inputValue = scoreInputs.value[player.id.value]
      const currentScore = currentRound.value.getScore(player.id)
      const hadEnteredScore = currentScore && RoundScore.isEntered(currentScore)

      // Empty input - clear if previously entered
      if (inputValue === '' || inputValue === undefined) {
        if (hadEnteredScore) {
          try {
            const updatedGame = await service.clearScore(player.id.value, currentRoundIndex.value)
            game.value = updatedGame
          } catch {
            toast.error('Failed to clear score')
          }
        }
        continue
      }

      const numericValue = parseInt(inputValue, 10)
      if (isNaN(numericValue)) continue

      const normalizedValue = normalizeScore(numericValue)

      // Check if score differs from persisted value
      const persistedValue = hadEnteredScore ? currentScore.value.value : null

      if (persistedValue !== normalizedValue) {
        try {
          const updatedGame = await service.setScore(
            player.id.value,
            currentRoundIndex.value,
            normalizedValue,
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
    recentlySaved,
    initializeScoreInputs,
    handleScoreBlur,
    saveUnsavedScores,
    showSaveFeedback,
  }
}
