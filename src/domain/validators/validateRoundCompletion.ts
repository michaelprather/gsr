import { Feedback } from '@/core'
import type { Round } from '../entities'
import type { Player } from '../entities'
import { RoundScore } from '../valueObjects'

export function validateRoundCompletion(
  round: Round,
  _roundIndex: number,
  players: readonly Player[],
): Feedback {
  const errors: string[] = []

  // Count players with entered scores and winners (score = 0)
  let enteredScoreCount = 0
  let zeroScoreCount = 0
  for (const player of players) {
    const score = round.getScore(player.id)
    if (score && RoundScore.isEntered(score)) {
      enteredScoreCount++
      if (score.value.value === 0) {
        zeroScoreCount++
      }
    }
  }

  // No scores at all = skipped round (valid)
  // At least one score but fewer than two = invalid (can't play alone)
  // At least one score but no winner = invalid
  if (enteredScoreCount === 1) {
    errors.push('At least two players must have scores')
  } else if (enteredScoreCount > 0 && zeroScoreCount === 0) {
    errors.push('Select a round winner')
  } else if (zeroScoreCount > 1) {
    errors.push('Only one player can win the round')
  }

  return Feedback.fromRecord({ round: errors })
}
