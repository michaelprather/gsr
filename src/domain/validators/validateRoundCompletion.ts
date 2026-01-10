import { Feedback } from '@/core'
import type { Round } from '../entities'
import type { Player } from '../entities'
import { RoundScore } from '../valueObjects'

export function validateRoundCompletion(
  round: Round,
  roundIndex: number,
  players: readonly Player[],
): Feedback {
  const errors: string[] = []

  const activePlayers = players.filter((p) => !isPlayerSkippedForRound(p, round, roundIndex))

  // Check all active players have entered scores
  const playersWithoutScores: string[] = []
  for (const player of activePlayers) {
    const score = round.getScore(player.id)
    if (!score || RoundScore.isPending(score)) {
      playersWithoutScores.push(player.name)
    }
  }

  if (playersWithoutScores.length > 0) {
    errors.push(`Missing scores for: ${playersWithoutScores.join(', ')}`)
  }

  // Check exactly one player has score 0 (the round winner)
  let zeroScoreCount = 0
  for (const player of activePlayers) {
    const score = round.getScore(player.id)
    if (score && RoundScore.isEntered(score) && score.value.value === 0) {
      zeroScoreCount++
    }
  }

  if (zeroScoreCount === 0 && playersWithoutScores.length === 0) {
    errors.push('Exactly one player must have a score of 0 (the round winner)')
  } else if (zeroScoreCount > 1) {
    errors.push('Only one player can have a score of 0')
  }

  return Feedback.fromRecord({ round: errors })
}

function isPlayerSkippedForRound(
  player: Player,
  round: Round,
  roundIndex: number,
): boolean {
  // Check if player is marked to skip from a certain round
  if (player.isSkippedAt(roundIndex)) {
    return true
  }

  // Check if player's score is explicitly marked as skipped for this round
  const score = round.getScore(player.id)
  return score !== undefined && RoundScore.isSkipped(score)
}
