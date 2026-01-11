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

    // Alice ranks first (played 1 round), Bob ranks second (skipped, 0 rounds played)
    expect(rankings[0]!.playerName).toBe('Alice')
    expect(rankings[0]!.hasSkippedRounds).toBe(false)
    expect(rankings[0]!.roundsPlayed).toBe(1)

    expect(rankings[1]!.playerName).toBe('Bob')
    expect(rankings[1]!.hasSkippedRounds).toBe(true)
    expect(rankings[1]!.roundsPlayed).toBe(0)
  })

  it('ranks players with more rounds played higher regardless of score', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    // Only Alice has a score (Bob has no scores entered)
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(50))),
    )

    const rankings = calculateRankings(updated)

    // Alice played 1 round, Bob played 0 rounds
    // Alice ranks first because she played more rounds
    const aliceRanking = rankings.find((r) => r.playerName === 'Alice')
    const bobRanking = rankings.find((r) => r.playerName === 'Bob')

    expect(aliceRanking!.roundsPlayed).toBe(1)
    expect(aliceRanking!.rank).toBe(1)
    expect(bobRanking!.roundsPlayed).toBe(0)
    expect(bobRanking!.total).toBe(0)
    expect(bobRanking!.rank).toBe(2)
  })

  it('uses lowest score as tiebreaker when rounds played are equal', () => {
    const game = Game.create(['Alice', 'Bob', 'Charlie'])
    const alice = game.players[0]!
    const bob = game.players[1]!
    const charlie = game.players[2]!

    // All players play 1 round with different scores
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

    // All played 1 round, so sorted by score (lowest first)
    expect(rankings.map((r) => r.playerName)).toEqual(['Bob', 'Charlie', 'Alice'])
    expect(rankings.map((r) => r.roundsPlayed)).toEqual([1, 1, 1])
    expect(rankings.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('prioritizes rounds played over lower score', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!
    const bob = game.players[1]!

    // Alice plays 2 rounds with high scores, Bob plays 1 round with low score
    let updated = game
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(alice.id, RoundScore.entered(Score.create(100))),
    )
    updated = updated.updateRound(
      0,
      updated.rounds[0]!.setScore(bob.id, RoundScore.entered(Score.create(20))),
    )
    updated = updated.updateRound(
      1,
      updated.rounds[1]!.setScore(alice.id, RoundScore.entered(Score.create(100))),
    )
    // Bob skips round 1
    updated = updated.updateRound(1, updated.rounds[1]!.setScore(bob.id, RoundScore.skipped()))

    const rankings = calculateRankings(updated)

    // Alice: 2 rounds, 200 total
    // Bob: 1 round, 20 total
    // Alice ranks first because she played more rounds
    expect(rankings[0]!.playerName).toBe('Alice')
    expect(rankings[0]!.roundsPlayed).toBe(2)
    expect(rankings[0]!.total).toBe(200)
    expect(rankings[0]!.rank).toBe(1)

    expect(rankings[1]!.playerName).toBe('Bob')
    expect(rankings[1]!.roundsPlayed).toBe(1)
    expect(rankings[1]!.total).toBe(20)
    expect(rankings[1]!.rank).toBe(2)
  })
})
