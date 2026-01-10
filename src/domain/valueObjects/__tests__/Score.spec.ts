import { describe, it, expect } from 'vitest'
import { Score } from '../Score'

describe('Score', () => {
  describe('create', () => {
    it('creates score with valid value', () => {
      const score = Score.create(25)
      expect(score.value).toBe(25)
    })

    it('creates score of 0', () => {
      const score = Score.create(0)
      expect(score.value).toBe(0)
    })

    it('creates score of 300', () => {
      const score = Score.create(300)
      expect(score.value).toBe(300)
    })

    it('throws for negative value', () => {
      expect(() => Score.create(-5)).toThrow('Invalid score')
    })

    it('throws for value over 300', () => {
      expect(() => Score.create(305)).toThrow('Invalid score')
    })

    it('throws for value not divisible by 5', () => {
      expect(() => Score.create(23)).toThrow('Invalid score')
    })
  })

  describe('zero', () => {
    it('creates score of 0', () => {
      const score = Score.zero()
      expect(score.value).toBe(0)
    })
  })

  describe('equals', () => {
    it('returns true for equal scores', () => {
      const score1 = Score.create(50)
      const score2 = Score.create(50)
      expect(score1.equals(score2)).toBe(true)
    })

    it('returns false for different scores', () => {
      const score1 = Score.create(50)
      const score2 = Score.create(75)
      expect(score1.equals(score2)).toBe(false)
    })
  })
})
