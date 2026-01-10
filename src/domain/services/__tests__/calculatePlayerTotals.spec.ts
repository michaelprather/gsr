import { describe, it, expect } from 'vitest'
import { calculatePlayerTotals } from '../calculatePlayerTotals'
import { Game } from '../../entities'
import { RoundScore, Score } from '../../valueObjects'

describe('calculatePlayerTotals', () => {
  it('returns empty object for game with no players', () => {
    const game = Game.create([])
    const totals = calculatePlayerTotals(game)
    expect(totals).toEqual({})
  })

  it('returns 0 for players with no entered scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    const totals = calculatePlayerTotals(game)

    const alice = game.players[0]!
    const bob = game.players[1]!

    expect(totals[alice.id.value]).toBe(0)
    expect(totals[bob.id.value]).toBe(0)
  })

  it('sums entered scores correctly', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(50))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(30))),
    )

    const totals = calculatePlayerTotals(updated)

    expect(totals[alice.id.value]).toBe(50)
    expect(totals[bob.id.value]).toBe(30)
  })

  it('sums scores across multiple rounds', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Round 0: Alice=20, Bob=30
    // Round 1: Alice=25, Bob=10
    // Total: Alice=45, Bob=40
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(20))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(30))),
    )
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(alice.id, RoundScore.entered(Score.create(25))),
    )
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(bob.id, RoundScore.entered(Score.create(10))),
    )

    const totals = calculatePlayerTotals(updated)

    expect(totals[alice.id.value]).toBe(45)
    expect(totals[bob.id.value]).toBe(40)
  })

  it('ignores skipped scores in total', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    let updated = game
    // Alice has entered score, Bob is skipped
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(50))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.skipped()),
    )

    const totals = calculatePlayerTotals(updated)

    expect(totals[alice.id.value]).toBe(50)
    expect(totals[bob.id.value]).toBe(0)
  })

  it('ignores pending scores in total', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Only set score for Alice, Bob stays pending
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(50))),
    )

    const totals = calculatePlayerTotals(updated)

    expect(totals[alice.id.value]).toBe(50)
    expect(totals[bob.id.value]).toBe(0)
  })

  it('returns totals keyed by player id value', () => {
    const game = Game.create(['Alice'])
    const alice = game.players[0]!

    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(25))),
    )

    const totals = calculatePlayerTotals(updated)

    // Verify the key is the player id string value
    expect(Object.keys(totals)).toContain(alice.id.value)
    expect(totals[alice.id.value]).toBe(25)
  })
})
