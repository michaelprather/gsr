import { describe, it, expect } from 'vitest'
import { findFirstInvalidRoundIndex } from '../findFirstInvalidRoundIndex'
import { Game, Player, Round } from '../../entities'
import { RoundScore, RoundType, Score } from '../../valueObjects'

function createTestGame(playerNames: string[], roundCount: number): Game {
  const players = playerNames.map((name) => Player.create(name))
  const allTypes = RoundType.all()
  const rounds = allTypes.slice(0, roundCount).map((type) => Round.create(type))
  return Game.hydrate(players, rounds, false)
}

describe('findFirstInvalidRoundIndex', () => {
  it('returns -1 when all rounds are valid', () => {
    const game = createTestGame(['Alice', 'Bob'], 2)
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Complete both rounds with valid scores (one player has 0)
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

    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(-1)
  })

  it('treats rounds with no scores as skipped (valid)', () => {
    const game = Game.create(['Alice', 'Bob'])
    // No scores entered - round is skipped, treated as valid
    const result = findFirstInvalidRoundIndex(game)
    expect(result).toBe(-1)
  })

  it('returns -1 when remaining rounds have no scores (skipped)', () => {
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

    // Round 1 has no scores = skipped
    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(-1)
  })

  it('treats rounds where all players are skipped as valid', () => {
    const game = createTestGame(['Alice', 'Bob'], 2)
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Skip all players in round 0
    let updated = game
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(alice.id, RoundScore.skipped()))
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(bob.id, RoundScore.skipped()))

    // Complete round 1 with valid scores
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(alice.id, RoundScore.entered(Score.create(0))),
    )
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(bob.id, RoundScore.entered(Score.create(30))),
    )

    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(-1)
  })

  it('skips explicitly-skipped rounds and empty rounds', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Skip all players in round 0
    let updated = game
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(alice.id, RoundScore.skipped()))
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(bob.id, RoundScore.skipped()))

    // Round 1 has no scores = also skipped
    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(-1)
  })

  it('returns first invalid round when no round winner exists', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Set scores but no one has 0 (no round winner)
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(20))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(30))),
    )

    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(0)
  })

  it('treats round as valid when winner exists and others have no scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    // Alice wins (score 0), Bob has no score (implicitly skipped)
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(0))),
    )

    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(-1) // Round 0 valid (has winner), remaining rounds valid (no scores = skipped)
  })

  it('handles game with no players', () => {
    const game = Game.create([])
    const result = findFirstInvalidRoundIndex(game)
    // No rounds exist, so all (zero) rounds are valid
    expect(result).toBe(-1)
  })

  it('treats round with only skip markers as skipped (valid)', () => {
    const game = Game.create(['Alice', 'Bob', 'Charlie'])
    const alice = game.players[0]!

    // Alice has explicit skip, Bob and Charlie have no scores
    // No entered scores = round is skipped
    let updated = game
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(alice.id, RoundScore.skipped()))

    const result = findFirstInvalidRoundIndex(updated)
    expect(result).toBe(-1)
  })
})
