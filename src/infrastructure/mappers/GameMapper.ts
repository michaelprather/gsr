import { Game, Player, Round, PlayerId, RoundType, RoundScore, Score } from '@/domain'
import type { RoundTypeName } from '@/domain'

export interface RoundScoreDTO {
  type: 'pending' | 'entered' | 'skipped'
  value?: number
}

export interface PlayerDTO {
  id: string
  name: string
  skipFromRound: number | null
}

export interface RoundDTO {
  type: RoundTypeName
  scores: Record<string, RoundScoreDTO>
  isLocked: boolean
}

export interface GameDTO {
  players: PlayerDTO[]
  rounds: RoundDTO[]
  isEnded: boolean
}

export class GameMapper {
  toDTO(game: Game): GameDTO {
    return {
      players: game.players.map((p) => this.playerToDTO(p)),
      rounds: game.rounds.map((r) => this.roundToDTO(r)),
      isEnded: game.isEnded,
    }
  }

  toDomain(dto: GameDTO): Game {
    const players = dto.players.map((p) => this.playerToDomain(p))
    const rounds = dto.rounds.map((r) => this.roundToDomain(r))
    return Game.hydrate(players, rounds, dto.isEnded)
  }

  private playerToDTO(player: Player): PlayerDTO {
    return {
      id: player.id.value,
      name: player.name,
      skipFromRound: player.skipFromRound,
    }
  }

  private playerToDomain(dto: PlayerDTO): Player {
    return Player.hydrate(PlayerId.create(dto.id), dto.name, dto.skipFromRound)
  }

  private roundToDTO(round: Round): RoundDTO {
    const scores: Record<string, RoundScoreDTO> = {}
    for (const [playerId, score] of round.scores) {
      scores[playerId] = this.roundScoreToDTO(score)
    }
    return {
      type: round.type.name,
      scores,
      isLocked: round.isLocked,
    }
  }

  private roundToDomain(dto: RoundDTO): Round {
    const scores = new Map<string, RoundScore>()
    for (const [playerId, scoreDTO] of Object.entries(dto.scores)) {
      scores.set(playerId, this.roundScoreToDomain(scoreDTO))
    }
    return Round.hydrate(RoundType.fromName(dto.type), scores, dto.isLocked)
  }

  private roundScoreToDTO(score: RoundScore): RoundScoreDTO {
    if (score.type === 'entered') {
      return { type: 'entered', value: score.value.value }
    }
    return { type: score.type }
  }

  private roundScoreToDomain(dto: RoundScoreDTO): RoundScore {
    switch (dto.type) {
      case 'pending':
        return RoundScore.pending()
      case 'skipped':
        return RoundScore.skipped()
      case 'entered':
        return RoundScore.entered(Score.create(dto.value!))
    }
  }
}
