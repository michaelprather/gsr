import type { Game } from '../entities'
import { RoundScore } from '../valueObjects'

export interface PlayerRanking {
  readonly playerId: string
  readonly playerName: string
  readonly rank: number
  readonly total: number
  readonly hasSkippedRounds: boolean
}

export function calculateRankings(game: Game): PlayerRanking[] {
  // Calculate totals and check for skipped rounds
  const playerData = game.players.map((player) => {
    let total = 0
    let hasSkippedRounds = false

    for (const round of game.rounds) {
      if (!round) continue
      const score = round.getScore(player.id)

      if (score && RoundScore.isEntered(score)) {
        total += score.value.value
      } else if (score && RoundScore.isSkipped(score)) {
        hasSkippedRounds = true
      }
    }

    return {
      playerId: player.id.value,
      playerName: player.name,
      total,
      hasSkippedRounds,
    }
  })

  // Sort by total ascending (lowest score wins in golf)
  const sorted = [...playerData].sort((a, b) => a.total - b.total)

  // Assign ranks with tie handling
  const rankings: PlayerRanking[] = []
  let currentRank = 1

  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i]
    if (!player) continue

    const previousPlayer = sorted[i - 1]
    const previousRanking = rankings[i - 1]

    // If tied with previous player, use the same rank
    if (i > 0 && previousPlayer && previousRanking && player.total === previousPlayer.total) {
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
