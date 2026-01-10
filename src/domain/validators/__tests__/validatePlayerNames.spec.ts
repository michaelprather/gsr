import { describe, it, expect } from 'vitest'
import { validatePlayerNames } from '../validatePlayerNames'

describe('validatePlayerNames', () => {
  it('returns no feedback for valid names', () => {
    const feedback = validatePlayerNames(['Alice', 'Bob'])
    expect(feedback.hasFeedback).toBe(false)
  })

  it('returns no feedback for 8 players', () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const feedback = validatePlayerNames(names)
    expect(feedback.hasFeedback).toBe(false)
  })

  it('returns feedback for fewer than 2 players', () => {
    const feedback = validatePlayerNames(['Alice'])
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('At least 2 players required')
  })

  it('returns feedback for empty list', () => {
    const feedback = validatePlayerNames([])
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('At least 2 players required')
  })

  it('returns feedback for more than 8 players', () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    const feedback = validatePlayerNames(names)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('Maximum 8 players allowed')
  })

  it('returns feedback for empty name', () => {
    const feedback = validatePlayerNames(['Alice', ''])
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('Player names cannot be empty')
  })

  it('returns feedback for whitespace-only name', () => {
    const feedback = validatePlayerNames(['Alice', '   '])
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('Player names cannot be empty')
  })

  it('returns feedback for duplicate names (case insensitive)', () => {
    const feedback = validatePlayerNames(['Alice', 'alice'])
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('Player names must be unique')
  })

  it('returns multiple errors for multiple violations', () => {
    const feedback = validatePlayerNames(['Alice'])
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('players')).toContain('At least 2 players required')
  })
})
