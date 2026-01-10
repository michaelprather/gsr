import { Feedback, ValidationError } from '@/core'
import {
  Game,
  Player,
  Round,
  RoundScore,
  Score,
  validatePlayerNames,
  validateScore,
  validateRoundCompletion,
} from '@/domain'
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

    if (round.isLocked) {
      throw new ValidationError(Feedback.fromRecord({ round: ['Round is locked'] }))
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

    if (round.isLocked) {
      throw new ValidationError(Feedback.fromRecord({ round: ['Round is locked'] }))
    }

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

  async lockRound(roundIndex: number): Promise<Game> {
    const game = await this.requireGame()
    const round = this.getRound(game, roundIndex)

    if (round.isLocked) {
      throw new ValidationError(Feedback.fromRecord({ round: ['Round is already locked'] }))
    }

    // Validate round completion before locking
    const completionFeedback = validateRoundCompletion(round, roundIndex, game.players)
    if (completionFeedback.hasFeedback) {
      throw new ValidationError(completionFeedback)
    }

    const updatedRound = round.lock()
    const updatedGame = game.updateRound(roundIndex, updatedRound)

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async unlockRound(roundIndex: number): Promise<Game> {
    const game = await this.requireGame()
    const round = this.getRound(game, roundIndex)

    if (!round.isLocked) {
      throw new ValidationError(Feedback.fromRecord({ round: ['Round is not locked'] }))
    }

    if (game.isEnded) {
      throw new ValidationError(Feedback.fromRecord({ game: ['Cannot unlock round in ended game'] }))
    }

    const updatedRound = round.unlock()
    const updatedGame = game.updateRound(roundIndex, updatedRound)

    await this.repo.save(updatedGame)
    return updatedGame
  }

  async endGame(): Promise<Game> {
    const game = await this.requireGame()

    if (game.isEnded) {
      throw new ValidationError(Feedback.fromRecord({ game: ['Game is already ended'] }))
    }

    // Validate all rounds are locked
    const unlockedRounds = game.rounds
      .map((r, i) => ({ round: r, index: i }))
      .filter(({ round }) => !round.isLocked)

    if (unlockedRounds.length > 0) {
      throw new ValidationError(
        Feedback.fromRecord({ game: ['All rounds must be locked before ending the game'] }),
      )
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
