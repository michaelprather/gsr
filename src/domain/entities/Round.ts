import type { PlayerId, RoundScore } from '../valueObjects'
import { RoundType } from '../valueObjects'

export class Round {
  private constructor(
    readonly type: RoundType,
    readonly scores: ReadonlyMap<string, RoundScore>,
  ) {}

  static create(type: RoundType): Round {
    return new Round(type, new Map())
  }

  static hydrate(type: RoundType, scores: ReadonlyMap<string, RoundScore>): Round {
    return new Round(type, scores)
  }

  setScore(playerId: PlayerId, score: RoundScore): Round {
    const newScores = new Map(this.scores)
    newScores.set(playerId.value, score)
    return new Round(this.type, newScores)
  }

  getScore(playerId: PlayerId): RoundScore | undefined {
    return this.scores.get(playerId.value)
  }
}
