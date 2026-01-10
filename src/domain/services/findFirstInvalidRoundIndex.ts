import type { Game } from '../entities'
import { RoundScore } from '../valueObjects'
import { validateRoundCompletion } from '../validators'

/**
 * Finds the index of the first invalid round in a game.
 * Rounds where all players are skipped are considered valid.
 * Returns -1 if all rounds are valid.
 */
export function findFirstInvalidRoundIndex(game: Game): number {
  for (let i = 0; i < game.rounds.length; i++) {
    const round = game.rounds[i]
    if (!round) continue

    // Check if all players are skipped (treat as valid)
    const allSkipped = game.players.every((player) => {
      const score = round.getScore(player.id)
      return score !== undefined && RoundScore.isSkipped(score)
    })

    if (allSkipped) continue

    // Check standard validation
    const feedback = validateRoundCompletion(round, i, game.players)
    if (feedback.hasFeedback) {
      return i
    }
  }

  return -1
}
