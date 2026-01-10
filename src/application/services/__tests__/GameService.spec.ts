import { describe, it, expect, beforeEach } from 'vitest'
import { GameService } from '../GameService'
import { ValidationError } from '@/core'
import type { Game, GameRepository } from '@/domain'

class InMemoryGameRepository implements GameRepository {
  private game: Game | null = null

  async save(game: Game): Promise<void> {
    this.game = game
  }

  async load(): Promise<Game | null> {
    return this.game
  }

  async clear(): Promise<void> {
    this.game = null
  }
}

describe('GameService', () => {
  let service: GameService
  let repo: InMemoryGameRepository

  beforeEach(() => {
    repo = new InMemoryGameRepository()
    service = new GameService(repo)
  })

  describe('startGame', () => {
    it('creates game with valid players', async () => {
      const game = await service.startGame(['Alice', 'Bob'])

      expect(game.players).toHaveLength(2)
      expect(game.rounds).toHaveLength(7)
    })

    it('persists the game', async () => {
      await service.startGame(['Alice', 'Bob'])

      const loaded = await repo.load()
      expect(loaded).not.toBeNull()
    })

    it('throws for fewer than 2 players', async () => {
      await expect(service.startGame(['Alice'])).rejects.toThrow(ValidationError)
    })

    it('throws for more than 8 players', async () => {
      const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
      await expect(service.startGame(names)).rejects.toThrow(ValidationError)
    })

    it('throws for empty player name', async () => {
      await expect(service.startGame(['Alice', ''])).rejects.toThrow(ValidationError)
    })

    it('throws for duplicate player names', async () => {
      await expect(service.startGame(['Alice', 'alice'])).rejects.toThrow(ValidationError)
    })
  })

  describe('loadGame', () => {
    it('returns null when no game exists', async () => {
      const game = await service.loadGame()
      expect(game).toBeNull()
    })

    it('returns game when exists', async () => {
      await service.startGame(['Alice', 'Bob'])

      const game = await service.loadGame()
      expect(game).not.toBeNull()
      expect(game!.players).toHaveLength(2)
    })
  })

  describe('setScore', () => {
    it('sets score for player', async () => {
      const game = await service.startGame(['Alice', 'Bob'])
      const playerId = game.players[0]!.id.value

      const updated = await service.setScore(playerId, 0, 25)

      const score = updated.rounds[0]?.getScore(updated.players[0]!.id)
      expect(score?.type).toBe('entered')
      expect(score?.type === 'entered' && score.value.value).toBe(25)
    })

    it('persists the change', async () => {
      const game = await service.startGame(['Alice', 'Bob'])
      const playerId = game.players[0]!.id.value

      await service.setScore(playerId, 0, 25)

      const loaded = await repo.load()
      const score = loaded!.rounds[0]?.getScore(loaded!.players[0]!.id)
      expect(score?.type).toBe('entered')
    })

    it('throws for invalid score', async () => {
      const game = await service.startGame(['Alice', 'Bob'])
      const playerId = game.players[0]!.id.value

      await expect(service.setScore(playerId, 0, 23)).rejects.toThrow(ValidationError)
    })

    it('throws when no game exists', async () => {
      await expect(service.setScore('any-id', 0, 25)).rejects.toThrow(ValidationError)
    })

    it('throws for invalid player', async () => {
      await service.startGame(['Alice', 'Bob'])

      await expect(service.setScore('invalid-id', 0, 25)).rejects.toThrow(ValidationError)
    })
  })

  describe('skipPlayer', () => {
    it('marks player as skipped for round', async () => {
      const game = await service.startGame(['Alice', 'Bob', 'Charlie'])
      const charlieId = game.players[2]!.id.value

      const updated = await service.skipPlayer(charlieId, 0, false)

      const score = updated.rounds[0]?.getScore(updated.players[2]!.id)
      expect(score?.type).toBe('skipped')
    })

    it('marks player to skip all future rounds when allFuture is true', async () => {
      const game = await service.startGame(['Alice', 'Bob', 'Charlie'])
      const charlieId = game.players[2]!.id.value

      const updated = await service.skipPlayer(charlieId, 2, true)

      expect(updated.players[2]?.skipFromRound).toBe(2)
    })
  })

  describe('unskipPlayer', () => {
    it('sets round score back to pending', async () => {
      const game = await service.startGame(['Alice', 'Bob', 'Charlie'])
      const charlieId = game.players[2]!.id.value

      await service.skipPlayer(charlieId, 0, false)
      const updated = await service.unskipPlayer(charlieId, 0)

      const score = updated.rounds[0]?.getScore(updated.players[2]!.id)
      expect(score?.type).toBe('pending')
    })

    it('clears skipFromRound when unskipping from the same round', async () => {
      const game = await service.startGame(['Alice', 'Bob', 'Charlie'])
      const charlieId = game.players[2]!.id.value

      await service.skipPlayer(charlieId, 2, true)
      expect((await repo.load())!.players[2]?.skipFromRound).toBe(2)

      const updated = await service.unskipPlayer(charlieId, 2)

      expect(updated.players[2]?.skipFromRound).toBeNull()
    })

    it('throws when trying to unskip from a later round after skip all', async () => {
      const game = await service.startGame(['Alice', 'Bob', 'Charlie'])
      const charlieId = game.players[2]!.id.value

      await service.skipPlayer(charlieId, 2, true)

      await expect(service.unskipPlayer(charlieId, 3)).rejects.toThrow(ValidationError)
    })
  })

  describe('endGame', () => {
    it('ends game', async () => {
      await service.startGame(['Alice', 'Bob'])

      const updated = await service.endGame()

      expect(updated.isEnded).toBe(true)
    })

    it('throws when already ended', async () => {
      await service.startGame(['Alice', 'Bob'])
      await service.endGame()

      await expect(service.endGame()).rejects.toThrow(ValidationError)
    })
  })

  describe('reopenGame', () => {
    it('reopens an ended game', async () => {
      await service.startGame(['Alice', 'Bob'])
      await service.endGame()

      const updated = await service.reopenGame()

      expect(updated.isEnded).toBe(false)
    })

    it('throws when game is not ended', async () => {
      await service.startGame(['Alice', 'Bob'])

      await expect(service.reopenGame()).rejects.toThrow(ValidationError)
    })
  })

  describe('clearGame', () => {
    it('removes the saved game', async () => {
      await service.startGame(['Alice', 'Bob'])

      await service.clearGame()

      const loaded = await service.loadGame()
      expect(loaded).toBeNull()
    })
  })
})
