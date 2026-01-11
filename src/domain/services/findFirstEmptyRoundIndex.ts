import type { Game } from '../entities'
import { RoundScore } from '../valueObjects'

/**
 * Finds the index of the first round without any player scores.
 * Returns -1 if all rounds have at least one score entered.
 */
export function findFirstEmptyRoundIndex(game: Game): number {
  for (let i = 0; i < game.rounds.length; i++) {
    const round = game.rounds[i]
    if (!round) continue

    // Check if any player has an entered score
    let hasEnteredScore = false
    for (const player of game.players) {
      const score = round.getScore(player.id)
      if (score && RoundScore.isEntered(score)) {
        hasEnteredScore = true
        break
      }
    }

    // No scores = this is the current round
    if (!hasEnteredScore) return i
  }

  return -1
}
