import type { Game } from '../entities'
import { RoundScore } from '../valueObjects'
import { validateRoundCompletion } from '../validators'

/**
 * Finds the index of the first incomplete round in a game.
 * A round is complete if it has a winner (score = 0).
 * A round is skipped (and valid) if no scores were entered at all.
 * Returns -1 if all rounds are complete or skipped.
 */
export function findFirstInvalidRoundIndex(game: Game): number {
  for (let i = 0; i < game.rounds.length; i++) {
    const round = game.rounds[i]
    if (!round) continue

    // Count entered scores and check for winner
    let hasEnteredScore = false
    let hasWinner = false
    for (const player of game.players) {
      const score = round.getScore(player.id)
      if (score && RoundScore.isEntered(score)) {
        hasEnteredScore = true
        if (score.value.value === 0) {
          hasWinner = true
        }
      }
    }

    // No scores = skipped round (valid)
    if (!hasEnteredScore) continue

    // Has scores but no winner = incomplete
    if (!hasWinner) return i

    // Has winner - check for other validation errors (e.g., multiple winners)
    const feedback = validateRoundCompletion(round, i, game.players)
    if (feedback.hasFeedback) {
      return i
    }
  }

  return -1
}
