import { Player } from './Player'
import { Round } from './Round'
import { RoundType } from '../valueObjects'

export class Game {
  private constructor(
    readonly players: readonly Player[],
    readonly rounds: readonly Round[],
    readonly isEnded: boolean,
  ) {}

  static create(playerNames: string[]): Game {
    if (playerNames.length < 2) {
      throw new Error('Game requires at least 2 players')
    }
    const players = playerNames.map((name) => Player.create(name))
    const rounds = RoundType.all().map((type) => Round.create(type))
    return new Game(players, rounds, false)
  }

  static hydrate(players: readonly Player[], rounds: readonly Round[], isEnded: boolean): Game {
    return new Game(players, rounds, isEnded)
  }

  updateRound(roundIndex: number, round: Round): Game {
    const newRounds = [...this.rounds]
    newRounds[roundIndex] = round
    return new Game(this.players, newRounds, this.isEnded)
  }

  updatePlayer(playerId: string, updater: (player: Player) => Player): Game {
    const newPlayers = this.players.map((p) => (p.id.value === playerId ? updater(p) : p))
    return new Game(newPlayers, this.rounds, this.isEnded)
  }

  end(): Game {
    return new Game(this.players, this.rounds, true)
  }
}
