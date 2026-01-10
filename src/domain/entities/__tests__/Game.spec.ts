import { describe, it, expect } from 'vitest'
import { Game } from '../Game'
import { RoundScore, Score } from '../../valueObjects'

describe('Game', () => {
  describe('create', () => {
    it('creates game with players', () => {
      const game = Game.create(['Alice', 'Bob', 'Charlie'])

      expect(game.players).toHaveLength(3)
      expect(game.players.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('creates 7 rounds', () => {
      const game = Game.create(['Alice', 'Bob'])

      expect(game.rounds).toHaveLength(7)
    })

    it('initializes rounds with correct types', () => {
      const game = Game.create(['Alice', 'Bob'])

      expect(game.rounds[0]?.type.displayName).toBe('2 Books')
      expect(game.rounds[6]?.type.displayName).toBe('3 Runs and Out')
    })

    it('starts not ended', () => {
      const game = Game.create(['Alice', 'Bob'])
      expect(game.isEnded).toBe(false)
    })
  })

  describe('updateRound', () => {
    it('updates round at index', () => {
      const game = Game.create(['Alice', 'Bob'])
      const playerId = game.players[0]!.id

      const updatedRound = game.rounds[0]!.setScore(playerId, RoundScore.entered(Score.create(25)))
      const updatedGame = game.updateRound(0, updatedRound)

      const score = updatedGame.rounds[0]?.getScore(playerId)
      expect(score?.type).toBe('entered')
    })

    it('does not mutate original game', () => {
      const game = Game.create(['Alice', 'Bob'])
      const playerId = game.players[0]!.id

      const updatedRound = game.rounds[0]!.setScore(playerId, RoundScore.entered(Score.create(25)))
      game.updateRound(0, updatedRound)

      expect(game.rounds[0]?.getScore(playerId)).toBeUndefined()
    })
  })

  describe('updatePlayer', () => {
    it('updates player by id', () => {
      const game = Game.create(['Alice', 'Bob'])
      const aliceId = game.players[0]!.id.value

      const updatedGame = game.updatePlayer(aliceId, (p) => p.skipFrom(3))

      expect(updatedGame.players[0]?.skipFromRound).toBe(3)
    })

    it('does not affect other players', () => {
      const game = Game.create(['Alice', 'Bob'])
      const aliceId = game.players[0]!.id.value

      const updatedGame = game.updatePlayer(aliceId, (p) => p.skipFrom(3))

      expect(updatedGame.players[1]?.skipFromRound).toBeNull()
    })
  })

  describe('end', () => {
    it('marks game as ended', () => {
      const game = Game.create(['Alice', 'Bob'])
      const ended = game.end()
      expect(ended.isEnded).toBe(true)
    })

    it('does not mutate original', () => {
      const game = Game.create(['Alice', 'Bob'])
      game.end()
      expect(game.isEnded).toBe(false)
    })
  })
})
