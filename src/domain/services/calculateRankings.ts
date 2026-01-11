import type { Game } from '../entities'
import { RoundScore } from '../valueObjects'

export interface PlayerRanking {
  readonly playerId: string
  readonly playerName: string
  readonly rank: number
  readonly total: number
  readonly roundsPlayed: number
  readonly hasSkippedRounds: boolean
}

export function calculateRankings(game: Game): PlayerRanking[] {
  // Calculate totals, rounds played, and check for skipped rounds
  const playerData = game.players.map((player) => {
    let total = 0
    let roundsPlayed = 0
    let hasSkippedRounds = false

    for (const round of game.rounds) {
      if (!round) continue
      const score = round.getScore(player.id)

      if (score && RoundScore.isEntered(score)) {
        total += score.value.value
        roundsPlayed++
      } else if (score && RoundScore.isSkipped(score)) {
        hasSkippedRounds = true
      }
    }

    return {
      playerId: player.id.value,
      playerName: player.name,
      total,
      roundsPlayed,
      hasSkippedRounds,
    }
  })

  // Sort by rounds played DESC (more rounds = better), then by total ASC (lower score = better)
  const sorted = [...playerData].sort((a, b) => {
    if (a.roundsPlayed !== b.roundsPlayed) {
      return b.roundsPlayed - a.roundsPlayed
    }
    return a.total - b.total
  })

  // Assign ranks with tie handling
  const rankings: PlayerRanking[] = []
  let currentRank = 1

  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i]
    if (!player) continue

    const previousPlayer = sorted[i - 1]
    const previousRanking = rankings[i - 1]

    // If tied with previous player (same rounds played AND same total), use the same rank
    const isTied =
      i > 0 &&
      previousPlayer &&
      previousRanking &&
      player.roundsPlayed === previousPlayer.roundsPlayed &&
      player.total === previousPlayer.total

    if (isTied) {
      rankings.push({
        ...player,
        rank: previousRanking.rank,
      })
    } else {
      rankings.push({
        ...player,
        rank: currentRank,
      })
    }

    currentRank++
  }

  return rankings
}
