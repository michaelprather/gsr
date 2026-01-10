import { describe, it, expect } from 'vitest'
import { Player } from '../Player'

describe('Player', () => {
  describe('create', () => {
    it('creates player with name', () => {
      const player = Player.create('Alice')
      expect(player.name).toBe('Alice')
      expect(player.skipFromRound).toBeNull()
    })

    it('trims whitespace from name', () => {
      const player = Player.create('  Bob  ')
      expect(player.name).toBe('Bob')
    })

    it('generates unique id', () => {
      const player1 = Player.create('Alice')
      const player2 = Player.create('Bob')
      expect(player1.id.equals(player2.id)).toBe(false)
    })

    it('throws for empty name', () => {
      expect(() => Player.create('')).toThrow('Player name cannot be empty')
    })

    it('throws for whitespace-only name', () => {
      expect(() => Player.create('   ')).toThrow('Player name cannot be empty')
    })
  })

  describe('skipFrom', () => {
    it('returns new player with skipFromRound set', () => {
      const player = Player.create('Alice')
      const skipped = player.skipFrom(3)

      expect(skipped.skipFromRound).toBe(3)
      expect(skipped.name).toBe('Alice')
      expect(skipped.id.equals(player.id)).toBe(true)
    })

    it('does not mutate original player', () => {
      const player = Player.create('Alice')
      player.skipFrom(3)

      expect(player.skipFromRound).toBeNull()
    })
  })

  describe('isSkippedAt', () => {
    it('returns false when not skipping', () => {
      const player = Player.create('Alice')
      expect(player.isSkippedAt(0)).toBe(false)
      expect(player.isSkippedAt(5)).toBe(false)
    })

    it('returns false for rounds before skip', () => {
      const player = Player.create('Alice').skipFrom(3)
      expect(player.isSkippedAt(0)).toBe(false)
      expect(player.isSkippedAt(2)).toBe(false)
    })

    it('returns true for skip round and after', () => {
      const player = Player.create('Alice').skipFrom(3)
      expect(player.isSkippedAt(3)).toBe(true)
      expect(player.isSkippedAt(4)).toBe(true)
      expect(player.isSkippedAt(6)).toBe(true)
    })
  })
})
