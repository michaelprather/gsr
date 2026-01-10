import { describe, it, expect } from 'vitest'
import { calculateRankings } from '../calculateRankings'
import { Game } from '../../entities'
import { RoundScore, Score } from '../../valueObjects'

describe('calculateRankings', () => {
  it('returns empty array for game with no players', () => {
    const game = Game.create([])
    const rankings = calculateRankings(game)
    expect(rankings).toEqual([])
  })

  it('returns players sorted by total ascending (lowest first)', () => {
    const game = Game.create(['Alice', 'Bob', 'Charlie'])
    const alice = game.players[0]!
    const bob = game.players[1]!
    const charlie = game.players[2]!

    // Set scores: Alice=50, Bob=30, Charlie=40
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(50))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(30))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(charlie.id, RoundScore.entered(Score.create(40))),
    )

    const rankings = calculateRankings(updated)

    expect(rankings.map((r) => r.playerName)).toEqual(['Bob', 'Charlie', 'Alice'])
    expect(rankings.map((r) => r.total)).toEqual([30, 40, 50])
    expect(rankings.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('handles tied scores by assigning same rank', () => {
    const game = Game.create(['Alice', 'Bob', 'Charlie'])
    const alice = game.players[0]!
    const bob = game.players[1]!
    const charlie = game.players[2]!

    // Set scores: Alice=30, Bob=30, Charlie=50
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(30))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(30))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(charlie.id, RoundScore.entered(Score.create(50))),
    )

    const rankings = calculateRankings(updated)

    // Alice and Bob tied at rank 1
    expect(rankings[0]!.rank).toBe(1)
    expect(rankings[1]!.rank).toBe(1)
    // Charlie at rank 3 (not 2, because two players are ahead)
    expect(rankings[2]!.rank).toBe(3)
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

    const rankings = calculateRankings(updated)

    expect(rankings[0]!.playerName).toBe('Bob')
    expect(rankings[0]!.total).toBe(40)
    expect(rankings[1]!.playerName).toBe('Alice')
    expect(rankings[1]!.total).toBe(45)
  })

  it('marks hasSkippedRounds for players with skipped scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Alice has a score, Bob is skipped
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(20))),
    )
    updated = updated.updateRound(0, updated.rounds[0]!.setScore(bob.id, RoundScore.skipped()))

    const rankings = calculateRankings(updated)

    const aliceRanking = rankings.find((r) => r.playerName === 'Alice')
    const bobRanking = rankings.find((r) => r.playerName === 'Bob')

    expect(aliceRanking!.hasSkippedRounds).toBe(false)
    expect(bobRanking!.hasSkippedRounds).toBe(true)
  })

  it('treats pending scores as 0', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    // Only Alice has a score
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(50))),
    )

    const rankings = calculateRankings(updated)

    // Bob has no score, so total is 0
    const bobRanking = rankings.find((r) => r.playerName === 'Bob')
    expect(bobRanking!.total).toBe(0)
    expect(bobRanking!.rank).toBe(1) // 0 < 50
  })
})
