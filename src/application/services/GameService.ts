import { Feedback, ValidationError } from '@/core'
import { Game, Player, Round, RoundScore, Score, validatePlayerNames, validateScore } from '@/domain'
import type { GameRepository } from '@/domain'

export class GameService {
  constructor(private readonly repo: GameRepository) {}

  async startGame(playerNames: string[]): Promise<Game> {
    const feedback = validatePlayerNames(playerNames)
    if (feedback.hasFeedback) {
      throw new ValidationError(feedback)
    }

    const game = Game.create(playerNames)
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

    if (player.isSkippedAt(roundIndex)) {
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

  async skipPlayer(
    playerId: string,
    roundIndex: number,
    allFuture: boolean,
  ): Promise<Game> {
    const game = await this.requireGame()
    const player = this.getPlayer(game, playerId)
    const round = this.getRound(game, roundIndex)

    let updatedGame = game

    // Mark score as skipped for this round
    const updatedRound = round.setScore(player.id, RoundScore.skipped())
    updatedGame = updatedGame.updateRound(roundIndex, updatedRound)

    // If allFuture, also mark player to skip all future rounds
    if (allFuture) {
      updatedGame = updatedGame.updatePlayer(playerId, (p) => p.skipFrom(roundIndex))
    }

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async unskipPlayer(playerId: string, roundIndex: number): Promise<Game> {
    const game = await this.requireGame()
    const player = this.getPlayer(game, playerId)
    const round = this.getRound(game, roundIndex)

    // Cannot unskip if player chose to skip all future rounds from an earlier round
    if (player.skipFromRound !== null && player.skipFromRound < roundIndex) {
      throw new ValidationError(
        Feedback.fromRecord({ player: ['Cannot unskip player who chose to skip rest of game'] }),
      )
    }

    // Set score back to pending
    const updatedRound = round.setScore(player.id, RoundScore.pending())
    let updatedGame = game.updateRound(roundIndex, updatedRound)

    // If player skipFromRound equals this round, clear it (they're unskipping their "skip all" choice)
    if (player.skipFromRound === roundIndex) {
      updatedGame = updatedGame.updatePlayer(playerId, (p) => Player.hydrate(p.id, p.name, null))
    }

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
