import type { Game, Round } from '../entities'
import type { PlayerId } from '../valueObjects'
import { RoundScore } from '../valueObjects'

export interface RoundResult {
  readonly roundIndex: number
  readonly roundName: string
  readonly score: number
  readonly isWin: boolean
}

export interface PlayerStats {
  readonly playerId: string
  readonly playerName: string
  readonly totalScore: number
  readonly roundsPlayed: number
  readonly roundsSkipped: number
  readonly roundsWon: number
  readonly winRate: number
  readonly averageScore: number
  readonly bestRound: RoundResult | null
  readonly worstRound: RoundResult | null
  readonly roundResults: readonly RoundResult[]
}

function findRoundWinner(round: Round, playerIds: readonly PlayerId[]): string | null {
  for (const playerId of playerIds) {
    const score = round.getScore(playerId)
    if (score && RoundScore.isEntered(score) && score.value.value === 0) {
      return playerId.value
    }
  }
  return null
}

export function calculatePlayerStats(game: Game, playerId: PlayerId): PlayerStats | null {
  const player = game.players.find((p) => p.id.equals(playerId))
  if (!player) return null

  const roundResults: RoundResult[] = []
  let totalScore = 0
  let roundsPlayed = 0
  let roundsSkipped = 0
  let roundsWon = 0

  for (let i = 0; i < game.rounds.length; i++) {
    const round = game.rounds[i]
    if (!round) continue

    const score = round.getScore(playerId)
    if (!score) continue

    if (RoundScore.isEntered(score)) {
      const scoreValue = score.value.value
      const isWin = scoreValue === 0
      const winner = findRoundWinner(round, game.players.map((p) => p.id))

      roundResults.push({
        roundIndex: i,
        roundName: round.type.displayName,
        score: scoreValue,
        isWin,
      })

      totalScore += scoreValue
      roundsPlayed++
      if (isWin) roundsWon++
    } else if (RoundScore.isSkipped(score)) {
      roundsSkipped++
    }
  }

  const winRate = roundsPlayed > 0 ? roundsWon / roundsPlayed : 0
  const averageScore = roundsPlayed > 0 ? totalScore / roundsPlayed : 0

  // Find best/worst rounds (wins are always the best outcome)
  const winResults = roundResults.filter((r) => r.isWin)
  const nonWinResults = roundResults.filter((r) => !r.isWin)
  const bestRound =
    winResults.length > 0
      ? winResults[0]!
      : nonWinResults.length > 0
        ? nonWinResults.reduce((best, r) => (r.score < best.score ? r : best))
        : null
  const worstRound =
    nonWinResults.length > 0
      ? nonWinResults.reduce((worst, r) => (r.score > worst.score ? r : worst))
      : null

  return {
    playerId: playerId.value,
    playerName: player.name,
    totalScore,
    roundsPlayed,
    roundsSkipped,
    roundsWon,
    winRate,
    averageScore,
    bestRound,
    worstRound,
    roundResults,
  }
}
