import { Feedback, ValidationError } from '@/core'
import {
  Game,
  Player,
  Round,
  RoundScore,
  Score,
  validatePlayerNames,
  validateScore,
} from '@/domain'
import type { GameRepository } from '@/domain'

export class GameService {
  constructor(private readonly repo: GameRepository) {}

  async startGame(playerNames: string[]): Promise<Game> {
    const feedback = validatePlayerNames(playerNames)
    if (feedback.hasFeedback) {
      throw new ValidationError(feedback)
    }

    const sortedNames = [...playerNames].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    )
    const game = Game.create(sortedNames)
    await this.repo.save(game)
    return game
  }

  async loadGame(): Promise<Game | null> {
    return this.repo.load()
  }

  async setScore(playerId: string, roundIndex: number, score: number): Promise<Game> {
    const game = await this.requireGame()
    const player = this.getPlayer(game, playerId)
    const round = this.getRound(game, roundIndex)

    const scoreFeedback = validateScore(score)
    if (scoreFeedback.hasFeedback) {
      throw new ValidationError(scoreFeedback)
    }

    const existingScore = round.getScore(player.id)
    if (existingScore && RoundScore.isSkipped(existingScore)) {
      throw new ValidationError(
        Feedback.fromRecord({ player: ['Player is skipped for this round'] }),
      )
    }

    const scoreValue = Score.create(score)
    const updatedRound = round.setScore(player.id, RoundScore.entered(scoreValue))
    const updatedGame = game.updateRound(roundIndex, updatedRound)

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async skipPlayer(playerId: string, roundIndex: number, allFuture: boolean): Promise<Game> {
    const game = await this.requireGame()
    const player = this.getPlayer(game, playerId)

    let updatedGame = game

    if (allFuture) {
      // Mark score as skipped for this round and all remaining rounds
      for (let i = roundIndex; i < game.rounds.length; i++) {
        const round = updatedGame.rounds[i]
        if (!round) continue
        const updatedRound = round.setScore(player.id, RoundScore.skipped())
        updatedGame = updatedGame.updateRound(i, updatedRound)
      }
    } else {
      // Mark score as skipped for this round only
      const round = this.getRound(game, roundIndex)
      const updatedRound = round.setScore(player.id, RoundScore.skipped())
      updatedGame = updatedGame.updateRound(roundIndex, updatedRound)
    }

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async unskipPlayer(playerId: string, roundIndex: number): Promise<Game> {
    const game = await this.requireGame()
    const player = this.getPlayer(game, playerId)
    const round = this.getRound(game, roundIndex)

    // Set score back to pending
    const updatedRound = round.setScore(player.id, RoundScore.pending())
    const updatedGame = game.updateRound(roundIndex, updatedRound)

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async clearScore(playerId: string, roundIndex: number): Promise<Game> {
    const game = await this.requireGame()
    const player = this.getPlayer(game, playerId)
    const round = this.getRound(game, roundIndex)

    const updatedRound = round.setScore(player.id, RoundScore.pending())
    const updatedGame = game.updateRound(roundIndex, updatedRound)

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async endGame(): Promise<Game> {
    const game = await this.requireGame()

    if (game.isEnded) {
      throw new ValidationError(Feedback.fromRecord({ game: ['Game is already ended'] }))
    }

    const updatedGame = game.end()
    await this.repo.save(updatedGame)
    return updatedGame
  }

  async reopenGame(): Promise<Game> {
    const game = await this.requireGame()

    if (!game.isEnded) {
      throw new ValidationError(Feedback.fromRecord({ game: ['Game is not ended'] }))
    }

    // Create a new game with isEnded = false using hydrate
    const updatedGame = Game.hydrate(game.players, game.rounds, false)
    await this.repo.save(updatedGame)
    return updatedGame
  }

  async clearGame(): Promise<void> {
    await this.repo.clear()
  }

  async importGame(game: Game): Promise<void> {
    await this.repo.save(game)
  }

  private async requireGame(): Promise<Game> {
    const game = await this.repo.load()
    if (!game) {
      throw new ValidationError(Feedback.fromRecord({ game: ['No active game'] }))
    }
    return game
  }

  private getPlayer(game: Game, playerId: string): Player {
    const player = game.players.find((p) => p.id.value === playerId)
    if (!player) {
      throw new ValidationError(Feedback.fromRecord({ player: ['Player not found'] }))
    }
    return player
  }

  private getRound(game: Game, roundIndex: number): Round {
    const round = game.rounds[roundIndex]
    if (!round) {
      throw new ValidationError(Feedback.fromRecord({ round: ['Invalid round index'] }))
    }
    return round
  }
}
