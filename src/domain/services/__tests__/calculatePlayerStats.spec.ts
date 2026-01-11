import { describe, it, expect } from 'vitest'
import { calculatePlayerStats } from '../calculatePlayerStats'
import { Game } from '../../entities'
import { PlayerId, RoundScore, Score } from '../../valueObjects'

describe('calculatePlayerStats', () => {
  function setScore(game: Game, playerIndex: number, roundIndex: number, score: number): Game {
    const player = game.players[playerIndex]!
    const round = game.rounds[roundIndex]!
    const updatedRound = round.setScore(player.id, RoundScore.entered(Score.create(score)))
    return game.updateRound(roundIndex, updatedRound)
  }

  function skipPlayer(game: Game, playerIndex: number, roundIndex: number): Game {
    const player = game.players[playerIndex]!
    const round = game.rounds[roundIndex]!
    const updatedRound = round.setScore(player.id, RoundScore.skipped())
    return game.updateRound(roundIndex, updatedRound)
  }

  it('returns null for non-existent player', () => {
    const game = Game.create(['Alice', 'Bob'])
    const fakeId = PlayerId.generate()

    const stats = calculatePlayerStats(game, fakeId)

    expect(stats).toBeNull()
  })

  it('returns player info', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats).not.toBeNull()
    expect(stats!.playerId).toBe(alice.id.value)
    expect(stats!.playerName).toBe('Alice')
  })

  it('calculates totalScore from all entered rounds', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50)
    game = setScore(game, 0, 1, 30)
    game = setScore(game, 0, 2, 20)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.totalScore).toBe(100)
  })

  it('calculates roundsPlayed correctly', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50)
    game = setScore(game, 0, 1, 30)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.roundsPlayed).toBe(2)
  })

  it('calculates roundsSkipped correctly', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50)
    game = skipPlayer(game, 0, 1)
    game = skipPlayer(game, 0, 2)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.roundsSkipped).toBe(2)
  })

  it('calculates roundsWon when score is 0', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 0) // Win
    game = setScore(game, 0, 1, 50)
    game = setScore(game, 0, 2, 0) // Win
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.roundsWon).toBe(2)
  })

  it('calculates winRate as roundsWon / roundsPlayed', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 0) // Win
    game = setScore(game, 0, 1, 50)
    game = setScore(game, 0, 2, 0) // Win
    game = setScore(game, 0, 3, 30)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.winRate).toBe(0.5) // 2 wins / 4 rounds
  })

  it('returns 0 winRate when no rounds played', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.winRate).toBe(0)
  })

  it('calculates averageScore correctly', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 60)
    game = setScore(game, 0, 1, 40)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.averageScore).toBe(50) // (60 + 40) / 2
  })

  it('returns 0 averageScore when no rounds played', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.averageScore).toBe(0)
  })

  it('returns roundResults with correct structure', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50)
    game = setScore(game, 0, 1, 0) // Win
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.roundResults).toHaveLength(2)

    expect(stats!.roundResults[0]).toEqual({
      roundIndex: 0,
      roundName: '2 Books',
      score: 50,
      isWin: false,
    })

    expect(stats!.roundResults[1]).toEqual({
      roundIndex: 1,
      roundName: '1 Book 1 Run',
      score: 0,
      isWin: true,
    })
  })

  it('selects bestRound as lowest non-win score', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50)
    game = setScore(game, 0, 1, 20) // Best non-win
    game = setScore(game, 0, 2, 35)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.bestRound).not.toBeNull()
    expect(stats!.bestRound!.roundIndex).toBe(1)
    expect(stats!.bestRound!.score).toBe(20)
  })

  it('selects worstRound as highest non-win score', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50) // Worst
    game = setScore(game, 0, 1, 20)
    game = setScore(game, 0, 2, 35)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.worstRound).not.toBeNull()
    expect(stats!.worstRound!.roundIndex).toBe(0)
    expect(stats!.worstRound!.score).toBe(50)
  })

  it('returns win as bestRound when all rounds are wins', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 0)
    game = setScore(game, 0, 1, 0)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.bestRound).not.toBeNull()
    expect(stats!.bestRound!.isWin).toBe(true)
  })

  it('returns null worstRound when all rounds are wins', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 0)
    game = setScore(game, 0, 1, 0)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.worstRound).toBeNull()
  })

  it('returns null for bestRound and worstRound when no rounds played', () => {
    const game = Game.create(['Alice', 'Bob'])
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.bestRound).toBeNull()
    expect(stats!.worstRound).toBeNull()
  })

  it('does not count skipped rounds in totals or results', () => {
    let game = Game.create(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 50)
    game = skipPlayer(game, 0, 1)
    game = setScore(game, 0, 2, 30)
    const alice = game.players[0]!

    const stats = calculatePlayerStats(game, alice.id)

    expect(stats!.totalScore).toBe(80) // Only entered rounds
    expect(stats!.roundsPlayed).toBe(2)
    expect(stats!.roundsSkipped).toBe(1)
    expect(stats!.roundResults).toHaveLength(2) // Skipped not in results
    expect(stats!.averageScore).toBe(40) // 80 / 2
  })
})
