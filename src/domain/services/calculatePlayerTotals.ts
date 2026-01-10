import type { Game } from '../entities'
import { RoundScore } from '../valueObjects'

export function calculatePlayerTotals(game: Game): Record<string, number> {
  const totals: Record<string, number> = {}

  for (const player of game.players) {
    let total = 0
    for (const round of game.rounds) {
      const score = round.getScore(player.id)
      if (score && RoundScore.isEntered(score)) {
        total += score.value.value
      }
    }
    totals[player.id.value] = total
  }

  return totals
}
