import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Game, Round } from '@/domain'
import { Game as GameClass, RoundScore, Score } from '@/domain'
import type { GameService } from '@/application'
import { useRoundScores } from '../useRoundScores'
import type { UseToastReturn } from '../useToast'

function createMockService(): GameService {
  return {
    startGame: vi.fn(),
    loadGame: vi.fn(),
    setScore: vi.fn(),
    skipPlayer: vi.fn(),
    unskipPlayer: vi.fn(),
    clearScore: vi.fn(),
    endGame: vi.fn(),
    reopenGame: vi.fn(),
    clearGame: vi.fn(),
    importGame: vi.fn(),
  } as unknown as GameService
}

function createMockToast(): UseToastReturn {
  return {
    toasts: ref([]),
    show: vi.fn(),
    dismiss: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  } as unknown as UseToastReturn
}

function createTestGame(): Game {
  return GameClass.create(['Alice', 'Bob'])
}

describe('useRoundScores', () => {
  let game: Ref<Game | null>
  let currentRoundIndex: Ref<number>
  let currentRound: ComputedRef<Round | null>
  let service: GameService
  let toast: UseToastReturn

  beforeEach(() => {
    game = ref<Game | null>(createTestGame())
    currentRoundIndex = ref(0)
    currentRound = computed<Round | null>(() => {
      if (!game.value) return null
      return game.value.rounds[currentRoundIndex.value] ?? null
    })
    service = createMockService()
    toast = createMockToast()
  })

  describe('initializeScoreInputs', () => {
    it('initializes empty inputs for all players', () => {
      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      roundScores.initializeScoreInputs()

      const playerIds = game.value!.players.map((p) => p.id.value)
      expect(Object.keys(roundScores.scoreInputs.value)).toHaveLength(2)
      for (const playerId of playerIds) {
        expect(roundScores.scoreInputs.value[playerId]).toBe('')
        expect(roundScores.scoreErrors.value[playerId]).toBeNull()
      }
    })

    it('populates inputs with existing entered scores', () => {
      // Set a score on round 0 for the first player
      const player = game.value!.players[0]!
      const round = game.value!.rounds[0]!
      const updatedRound = round.setScore(player.id, RoundScore.entered(Score.create(50)))
      game.value = game.value!.updateRound(0, updatedRound)

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      roundScores.initializeScoreInputs()

      expect(roundScores.scoreInputs.value[player.id.value]).toBe('50')
    })

    it('does nothing when game is null', () => {
      game.value = null

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      roundScores.initializeScoreInputs()

      expect(Object.keys(roundScores.scoreInputs.value)).toHaveLength(0)
    })
  })

  describe('handleScoreBlur', () => {
    it('clears error and does nothing for empty input', async () => {
      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = ''
      roundScores.scoreErrors.value[playerId] = 'Previous error'

      await roundScores.handleScoreBlur(playerId)

      expect(roundScores.scoreErrors.value[playerId]).toBeNull()
      expect(service.setScore).not.toHaveBeenCalled()
    })

    it('sets error for non-numeric input', async () => {
      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = 'abc'

      await roundScores.handleScoreBlur(playerId)

      expect(roundScores.scoreErrors.value[playerId]).toBe('Enter a valid number')
      expect(service.setScore).not.toHaveBeenCalled()
    })

    it('sets error for invalid score (not divisible by 5)', async () => {
      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = '53'

      await roundScores.handleScoreBlur(playerId)

      expect(roundScores.scoreErrors.value[playerId]).toBe('Score must be divisible by 5')
      expect(service.setScore).not.toHaveBeenCalled()
    })

    it('saves valid score and shows feedback', async () => {
      const updatedGame = createTestGame()
      vi.mocked(service.setScore).mockResolvedValue(updatedGame)

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = '50'

      await roundScores.handleScoreBlur(playerId)

      expect(service.setScore).toHaveBeenCalledWith(playerId, 0, 50)
      expect(roundScores.scoreErrors.value[playerId]).toBeNull()
      expect(roundScores.recentlySaved.value.has(playerId)).toBe(true)
    })

    it('sets error when save fails', async () => {
      vi.mocked(service.setScore).mockRejectedValue(new Error('Network error'))

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = '50'

      await roundScores.handleScoreBlur(playerId)

      expect(roundScores.scoreErrors.value[playerId]).toBe('Failed to save score')
    })
  })

  describe('saveUnsavedScores', () => {
    it('saves valid scores that differ from persisted values', async () => {
      const updatedGame = createTestGame()
      vi.mocked(service.setScore).mockResolvedValue(updatedGame)

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      roundScores.initializeScoreInputs()
      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = '100'

      await roundScores.saveUnsavedScores()

      expect(service.setScore).toHaveBeenCalledWith(playerId, 0, 100)
    })

    it('skips players with skipped status', async () => {
      // Mark first player as skipped
      const player = game.value!.players[0]!
      const round = game.value!.rounds[0]!
      const updatedRound = round.setScore(player.id, RoundScore.skipped())
      game.value = game.value!.updateRound(0, updatedRound)

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      roundScores.initializeScoreInputs()
      roundScores.scoreInputs.value[player.id.value] = '50'

      await roundScores.saveUnsavedScores()

      expect(service.setScore).not.toHaveBeenCalled()
    })

    it('shows toast error when save fails', async () => {
      vi.mocked(service.setScore).mockRejectedValue(new Error('Network error'))

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      roundScores.initializeScoreInputs()
      const playerId = game.value!.players[0]!.id.value
      roundScores.scoreInputs.value[playerId] = '100'

      await roundScores.saveUnsavedScores()

      expect(toast.error).toHaveBeenCalledWith('Failed to save score')
    })
  })

  describe('showSaveFeedback', () => {
    it('adds playerId to recentlySaved set', () => {
      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.showSaveFeedback(playerId)

      expect(roundScores.recentlySaved.value.has(playerId)).toBe(true)
    })

    it('removes playerId after timeout', async () => {
      vi.useFakeTimers()

      const roundScores = useRoundScores({
        game,
        currentRound,
        currentRoundIndex,
        service,
        toast,
      })

      const playerId = game.value!.players[0]!.id.value
      roundScores.showSaveFeedback(playerId)

      expect(roundScores.recentlySaved.value.has(playerId)).toBe(true)

      vi.advanceTimersByTime(300)

      expect(roundScores.recentlySaved.value.has(playerId)).toBe(false)

      vi.useRealTimers()
    })
  })
})
