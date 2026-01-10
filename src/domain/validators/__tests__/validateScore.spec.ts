import { describe, it, expect } from 'vitest'
import { validateScore } from '../validateScore'

describe('validateScore', () => {
  it('returns no feedback for valid score', () => {
    const feedback = validateScore(25)
    expect(feedback.hasFeedback).toBe(false)
  })

  it('returns no feedback for 0', () => {
    const feedback = validateScore(0)
    expect(feedback.hasFeedback).toBe(false)
  })

  it('returns no feedback for 300', () => {
    const feedback = validateScore(300)
    expect(feedback.hasFeedback).toBe(false)
  })

  it('returns feedback for negative score', () => {
    const feedback = validateScore(-5)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('score')).toContain('Score must be at least 0')
  })

  it('returns feedback for score over 300', () => {
    const feedback = validateScore(305)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('score')).toContain('Score must be at most 300')
  })

  it('returns feedback for score not divisible by 5', () => {
    const feedback = validateScore(23)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('score')).toContain('Score must be divisible by 5')
  })

  it('returns multiple errors for multiple violations', () => {
    const feedback = validateScore(-3)
    expect(feedback.hasFeedback).toBe(true)
    const errors = feedback.get('score')
    expect(errors).toContain('Score must be at least 0')
    expect(errors).toContain('Score must be divisible by 5')
  })
})
