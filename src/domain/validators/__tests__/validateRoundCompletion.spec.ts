import { describe, it, expect } from 'vitest'
import { validateRoundCompletion } from '../validateRoundCompletion'
import { Game, RoundScore, Score } from '@/domain'

describe('validateRoundCompletion', () => {
  it('returns no feedback when round is valid', () => {
    const game = Game.create(['Alice', 'Bob'])
    const round = game.rounds[0]!
      .setScore(game.players[0]!.id, RoundScore.entered(Score.zero()))
      .setScore(game.players[1]!.id, RoundScore.entered(Score.create(25)))

    const feedback = validateRoundCompletion(round, 0, game.players)
    expect(feedback.hasFeedback).toBe(false)
  })

  it('returns feedback when scores are missing', () => {
    const game = Game.create(['Alice', 'Bob'])
    const round = game.rounds[0]!.setScore(
      game.players[0]!.id,
      RoundScore.entered(Score.zero()),
    )

    const feedback = validateRoundCompletion(round, 0, game.players)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('round')?.some((e) => e.includes('Missing scores'))).toBe(true)
  })

  it('returns feedback when no player has zero score', () => {
    const game = Game.create(['Alice', 'Bob'])
    const round = game.rounds[0]!
      .setScore(game.players[0]!.id, RoundScore.entered(Score.create(25)))
      .setScore(game.players[1]!.id, RoundScore.entered(Score.create(50)))

    const feedback = validateRoundCompletion(round, 0, game.players)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('round')?.some((e) => e.includes('score of 0'))).toBe(true)
  })

  it('returns feedback when multiple players have zero score', () => {
    const game = Game.create(['Alice', 'Bob'])
    const round = game.rounds[0]!
      .setScore(game.players[0]!.id, RoundScore.entered(Score.zero()))
      .setScore(game.players[1]!.id, RoundScore.entered(Score.zero()))

    const feedback = validateRoundCompletion(round, 0, game.players)
    expect(feedback.hasFeedback).toBe(true)
    expect(feedback.get('round')?.some((e) => e.includes('Only one player'))).toBe(true)
  })

  it('excludes skipped players from validation', () => {
    const game = Game.create(['Alice', 'Bob', 'Charlie'])
    const round = game.rounds[0]!
      .setScore(game.players[0]!.id, RoundScore.entered(Score.zero()))
      .setScore(game.players[1]!.id, RoundScore.entered(Score.create(25)))
      .setScore(game.players[2]!.id, RoundScore.skipped())

    const feedback = validateRoundCompletion(round, 0, game.players)
    expect(feedback.hasFeedback).toBe(false)
  })
})
