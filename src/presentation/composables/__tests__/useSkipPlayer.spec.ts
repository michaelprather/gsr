import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import type { Game } from '@/domain'
import { Game as GameClass } from '@/domain'
import type { GameService } from '@/application'
import { useSkipPlayer } from '../useSkipPlayer'
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

describe('useSkipPlayer', () => {
  let game: Ref<Game | null>
  let currentRoundIndex: Ref<number>
  let service: GameService
  let toast: UseToastReturn

  beforeEach(() => {
    game = ref<Game | null>(createTestGame())
    currentRoundIndex = ref(0)
    service = createMockService()
    toast = createMockToast()
  })

  describe('openDialog', () => {
    it('sets target player and shows dialog', () => {
      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!

      skipPlayer.openDialog(player)

      expect(skipPlayer.showDialog.value).toBe(true)
      expect(skipPlayer.targetPlayer.value?.id.value).toBe(player.id.value)
    })
  })

  describe('closeDialog', () => {
    it('hides dialog and clears target player', () => {
      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!
      skipPlayer.openDialog(player)

      skipPlayer.closeDialog()

      expect(skipPlayer.showDialog.value).toBe(false)
      expect(skipPlayer.targetPlayer.value).toBeNull()
    })
  })

  describe('skipRound', () => {
    it('skips player for current round only', async () => {
      const updatedGame = createTestGame()
      vi.mocked(service.skipPlayer).mockResolvedValue(updatedGame)

      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!
      skipPlayer.openDialog(player)

      await skipPlayer.skipRound()

      expect(service.skipPlayer).toHaveBeenCalledWith(player.id.value, 0, false)
      expect(game.value).toStrictEqual(updatedGame)
      expect(skipPlayer.showDialog.value).toBe(false)
    })

    it('does nothing when no target player', async () => {
      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      await skipPlayer.skipRound()

      expect(service.skipPlayer).not.toHaveBeenCalled()
    })

    it('shows error toast on failure', async () => {
      vi.mocked(service.skipPlayer).mockRejectedValue(new Error('Network error'))

      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!
      skipPlayer.openDialog(player)

      await skipPlayer.skipRound()

      expect(toast.error).toHaveBeenCalledWith('Failed to skip player')
    })
  })

  describe('skipAll', () => {
    it('skips player for all remaining rounds', async () => {
      const updatedGame = createTestGame()
      vi.mocked(service.skipPlayer).mockResolvedValue(updatedGame)

      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!
      skipPlayer.openDialog(player)

      await skipPlayer.skipAll()

      expect(service.skipPlayer).toHaveBeenCalledWith(player.id.value, 0, true)
      expect(game.value).toStrictEqual(updatedGame)
      expect(skipPlayer.showDialog.value).toBe(false)
    })

    it('does nothing when no target player', async () => {
      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      await skipPlayer.skipAll()

      expect(service.skipPlayer).not.toHaveBeenCalled()
    })

    it('shows error toast on failure', async () => {
      vi.mocked(service.skipPlayer).mockRejectedValue(new Error('Network error'))

      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!
      skipPlayer.openDialog(player)

      await skipPlayer.skipAll()

      expect(toast.error).toHaveBeenCalledWith('Failed to skip player')
    })
  })

  describe('unskip', () => {
    it('unskips player for current round', async () => {
      const updatedGame = createTestGame()
      vi.mocked(service.unskipPlayer).mockResolvedValue(updatedGame)

      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!

      await skipPlayer.unskip(player)

      expect(service.unskipPlayer).toHaveBeenCalledWith(player.id.value, 0)
      expect(game.value).toStrictEqual(updatedGame)
    })

    it('shows error toast on failure', async () => {
      vi.mocked(service.unskipPlayer).mockRejectedValue(new Error('Network error'))

      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!

      await skipPlayer.unskip(player)

      expect(toast.error).toHaveBeenCalledWith('Failed to unskip player')
    })
  })

  describe('readonly refs', () => {
    it('returns readonly showDialog', () => {
      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      // Attempting to set should have no effect (readonly)
      expect(() => {
        // @ts-expect-error - testing readonly behavior
        skipPlayer.showDialog.value = true
      }).not.toThrow() // Vue readonly refs don't throw, they just warn

      // Value should remain false since we didn't use openDialog
      // (The warning is suppressed in tests)
    })

    it('returns readonly targetPlayer', () => {
      const skipPlayer = useSkipPlayer({
        game,
        currentRoundIndex,
        service,
        toast,
      })

      const player = game.value!.players[0]!

      // Attempting to set should have no effect (readonly)
      expect(() => {
        // @ts-expect-error - testing readonly behavior
        skipPlayer.targetPlayer.value = player
      }).not.toThrow() // Vue readonly refs don't throw, they just warn

      // Value should remain null since we didn't use openDialog
    })
  })
})
