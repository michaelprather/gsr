import { describe, it, expect } from 'vitest'
import { findFirstEmptyRoundIndex } from '../findFirstEmptyRoundIndex'
import { Game, Player, Round } from '../../entities'
import { RoundScore, RoundType, Score } from '../../valueObjects'

function createTestGame(playerNames: string[], roundCount: number): Game {
  const players = playerNames.map((name) => Player.create(name))
  const allTypes = RoundType.all()
  const rounds = allTypes.slice(0, roundCount).map((type) => Round.create(type))
  return Game.hydrate(players, rounds, false)
}

describe('findFirstEmptyRoundIndex', () => {
  it('returns -1 when all rounds have scores', () => {
    const game = createTestGame(['Alice', 'Bob'], 2)
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Both rounds have at least one score entered
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(0))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(50))),
    )
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(alice.id, RoundScore.entered(Score.create(30))),
    )
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(bob.id, RoundScore.entered(Score.create(0))),
    )

    const result = findFirstEmptyRoundIndex(updated)
    expect(result).toBe(-1)
  })

  it('returns 0 when no rounds have scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    // No scores entered - first round is current
    const result = findFirstEmptyRoundIndex(game)
    expect(result).toBe(0)
  })

  it('returns first round without scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Complete round 0
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(0))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(50))),
    )

    // Round 1 has no scores = current round
    const result = findFirstEmptyRoundIndex(updated)
    expect(result).toBe(1)
  })

  it('treats rounds with only skip markers as having no scores', () => {
    const game = createTestGame(['Alice', 'Bob'], 2)
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Skip markers are not entered scores
    let updated = game
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(alice.id, RoundScore.skipped()))
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(bob.id, RoundScore.skipped()))

    // Round 0 has only skips (no entered scores) = current round
    const result = findFirstEmptyRoundIndex(updated)
    expect(result).toBe(0)
  })

  it('returns -1 when round has partial scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    // Alice has a score, Bob does not
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(0))),
    )

    // Round 0 has at least one score, so look for next empty round
    const result = findFirstEmptyRoundIndex(updated)
    expect(result).toBe(1)
  })

  it('handles game with no players', () => {
    const game = Game.create([])
    const result = findFirstEmptyRoundIndex(game)
    // Rounds exist but with no players, so first round has no scores
    expect(result).toBe(0)
  })
})
