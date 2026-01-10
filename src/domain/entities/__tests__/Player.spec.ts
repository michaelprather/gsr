import { describe, it, expect } from 'vitest'
import { Player } from '../Player'

describe('Player', () => {
  describe('create', () => {
    it('creates player with name', () => {
      const player = Player.create('Alice')
      expect(player.name).toBe('Alice')
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
})
