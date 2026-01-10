import { describe, it, expect } from 'vitest'
import { RoundType } from '../RoundType'

describe('RoundType', () => {
  describe('all', () => {
    it('returns all 7 round types', () => {
      const types = RoundType.all()
      expect(types).toHaveLength(7)
    })

    it('returns types in correct order', () => {
      const types = RoundType.all()
      expect(types.map((t) => t.name)).toEqual([
        'twoBooks',
        'oneBookOneRun',
        'twoRuns',
        'twoBooksOneRun',
        'twoRunsOneBook',
        'threeBooks',
        'threeRunsAndOut',
      ])
    })
  })

  describe('fromName', () => {
    it('creates round type from valid name', () => {
      const type = RoundType.fromName('twoBooks')
      expect(type.name).toBe('twoBooks')
    })
  })

  describe('displayName', () => {
    it.each([
      ['twoBooks', '2 Books'],
      ['oneBookOneRun', '1 Book 1 Run'],
      ['twoRuns', '2 Runs'],
      ['twoBooksOneRun', '2 Books 1 Run'],
      ['twoRunsOneBook', '2 Runs 1 Book'],
      ['threeBooks', '3 Books'],
      ['threeRunsAndOut', '3 Runs and Out'],
    ] as const)('%s has display name "%s"', (name, displayName) => {
      const type = RoundType.fromName(name)
      expect(type.displayName).toBe(displayName)
    })
  })

  describe('equals', () => {
    it('returns true for same round type', () => {
      const type1 = RoundType.fromName('twoBooks')
      const type2 = RoundType.fromName('twoBooks')
      expect(type1.equals(type2)).toBe(true)
    })

    it('returns false for different round types', () => {
      const type1 = RoundType.fromName('twoBooks')
      const type2 = RoundType.fromName('twoRuns')
      expect(type1.equals(type2)).toBe(false)
    })
  })
})
