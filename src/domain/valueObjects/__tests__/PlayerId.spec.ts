import { describe, it, expect, vi } from 'vitest'
import { PlayerId } from '../PlayerId'

describe('PlayerId', () => {
  describe('create', () => {
    it('creates PlayerId with valid string', () => {
      const id = PlayerId.create('player-123')
      expect(id.value).toBe('player-123')
    })

    it('creates PlayerId with UUID string', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const id = PlayerId.create(uuid)
      expect(id.value).toBe(uuid)
    })

    it('throws for empty string', () => {
      expect(() => PlayerId.create('')).toThrow('PlayerId cannot be empty')
    })

    it('throws for whitespace-only string', () => {
      expect(() => PlayerId.create('   ')).toThrow('PlayerId cannot be empty')
    })

    it('throws for tab-only string', () => {
      expect(() => PlayerId.create('\t')).toThrow('PlayerId cannot be empty')
    })

    it('throws for newline-only string', () => {
      expect(() => PlayerId.create('\n')).toThrow('PlayerId cannot be empty')
    })
  })

  describe('generate', () => {
    it('generates a PlayerId', () => {
      const id = PlayerId.generate()
      expect(id.value).toBeDefined()
      expect(id.value.length).toBeGreaterThan(0)
    })

    it('generates unique PlayerIds', () => {
      const id1 = PlayerId.generate()
      const id2 = PlayerId.generate()
      expect(id1.value).not.toBe(id2.value)
    })

    it('uses crypto.randomUUID', () => {
      const mockUUID = 'mock-uuid-1234-5678-90ab-cdef12345678'
      vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce(mockUUID)

      const id = PlayerId.generate()

      expect(id.value).toBe(mockUUID)
    })
  })

  describe('equals', () => {
    it('returns true for equal PlayerIds', () => {
      const id1 = PlayerId.create('player-1')
      const id2 = PlayerId.create('player-1')
      expect(id1.equals(id2)).toBe(true)
    })

    it('returns false for different PlayerIds', () => {
      const id1 = PlayerId.create('player-1')
      const id2 = PlayerId.create('player-2')
      expect(id1.equals(id2)).toBe(false)
    })

    it('is symmetric', () => {
      const id1 = PlayerId.create('player-1')
      const id2 = PlayerId.create('player-1')
      expect(id1.equals(id2)).toBe(id2.equals(id1))
    })
  })

  describe('toString', () => {
    it('returns the value as string', () => {
      const id = PlayerId.create('player-abc')
      expect(id.toString()).toBe('player-abc')
    })

    it('can be used in string interpolation', () => {
      const id = PlayerId.create('player-xyz')
      expect(`ID: ${id}`).toBe('ID: player-xyz')
    })
  })
})
