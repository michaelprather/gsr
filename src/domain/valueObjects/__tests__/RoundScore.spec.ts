import { describe, it, expect } from 'vitest'
import { RoundScore } from '../RoundScore'
import { Score } from '../Score'

describe('RoundScore', () => {
  describe('pending', () => {
    it('creates a pending score', () => {
      const score = RoundScore.pending()
      expect(score.type).toBe('pending')
    })

    it('has no value property', () => {
      const score = RoundScore.pending()
      expect('value' in score).toBe(false)
    })
  })

  describe('entered', () => {
    it('creates an entered score with value', () => {
      const value = Score.create(50)
      const score = RoundScore.entered(value)

      expect(score.type).toBe('entered')
      if (RoundScore.isEntered(score)) {
        expect(score.value).toBe(value)
      }
    })

    it('preserves the score value', () => {
      const value = Score.create(100)
      const score = RoundScore.entered(value)

      if (RoundScore.isEntered(score)) {
        expect(score.value.value).toBe(100)
      }
    })

    it('creates entered score with zero', () => {
      const value = Score.zero()
      const score = RoundScore.entered(value)

      expect(score.type).toBe('entered')
      if (RoundScore.isEntered(score)) {
        expect(score.value.value).toBe(0)
      }
    })
  })

  describe('skipped', () => {
    it('creates a skipped score', () => {
      const score = RoundScore.skipped()
      expect(score.type).toBe('skipped')
    })

    it('has no value property', () => {
      const score = RoundScore.skipped()
      expect('value' in score).toBe(false)
    })
  })

  describe('isPending', () => {
    it('returns true for pending score', () => {
      const score = RoundScore.pending()
      expect(RoundScore.isPending(score)).toBe(true)
    })

    it('returns false for entered score', () => {
      const score = RoundScore.entered(Score.create(25))
      expect(RoundScore.isPending(score)).toBe(false)
    })

    it('returns false for skipped score', () => {
      const score = RoundScore.skipped()
      expect(RoundScore.isPending(score)).toBe(false)
    })

    it('narrows type to pending', () => {
      const score: RoundScore = RoundScore.pending()
      if (RoundScore.isPending(score)) {
        // TypeScript should allow this without error
        expect(score.type).toBe('pending')
      }
    })
  })

  describe('isEntered', () => {
    it('returns true for entered score', () => {
      const score = RoundScore.entered(Score.create(75))
      expect(RoundScore.isEntered(score)).toBe(true)
    })

    it('returns false for pending score', () => {
      const score = RoundScore.pending()
      expect(RoundScore.isEntered(score)).toBe(false)
    })

    it('returns false for skipped score', () => {
      const score = RoundScore.skipped()
      expect(RoundScore.isEntered(score)).toBe(false)
    })

    it('narrows type to entered with value', () => {
      const score: RoundScore = RoundScore.entered(Score.create(50))
      if (RoundScore.isEntered(score)) {
        // TypeScript should allow accessing value
        expect(score.value.value).toBe(50)
      }
    })
  })

  describe('isSkipped', () => {
    it('returns true for skipped score', () => {
      const score = RoundScore.skipped()
      expect(RoundScore.isSkipped(score)).toBe(true)
    })

    it('returns false for pending score', () => {
      const score = RoundScore.pending()
      expect(RoundScore.isSkipped(score)).toBe(false)
    })

    it('returns false for entered score', () => {
      const score = RoundScore.entered(Score.create(100))
      expect(RoundScore.isSkipped(score)).toBe(false)
    })

    it('narrows type to skipped', () => {
      const score: RoundScore = RoundScore.skipped()
      if (RoundScore.isSkipped(score)) {
        // TypeScript should allow this without error
        expect(score.type).toBe('skipped')
      }
    })
  })

})
