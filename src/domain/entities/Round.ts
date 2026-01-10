import type { PlayerId, RoundScore } from '../valueObjects'
import { RoundType } from '../valueObjects'

export class Round {
  private constructor(
    readonly type: RoundType,
    readonly scores: ReadonlyMap<string, RoundScore>,
    readonly isLocked: boolean,
  ) {}

  static create(type: RoundType): Round {
    return new Round(type, new Map(), false)
  }

  static hydrate(
    type: RoundType,
    scores: ReadonlyMap<string, RoundScore>,
    isLocked: boolean,
  ): Round {
    return new Round(type, scores, isLocked)
  }

  setScore(playerId: PlayerId, score: RoundScore): Round {
    if (this.isLocked) {
      throw new Error('Cannot modify scores on a locked round')
    }
    const newScores = new Map(this.scores)
    newScores.set(playerId.value, score)
    return new Round(this.type, newScores, this.isLocked)
  }

  getScore(playerId: PlayerId): RoundScore | undefined {
    return this.scores.get(playerId.value)
  }

  lock(): Round {
    return new Round(this.type, this.scores, true)
  }

  unlock(): Round {
    return new Round(this.type, this.scores, false)
  }
}
