import { PlayerId } from '../valueObjects'

export class Player {
  private constructor(
    readonly id: PlayerId,
    readonly name: string,
    readonly skipFromRound: number | null,
  ) {}

  static create(name: string): Player {
    const trimmed = name.trim()
    if (!trimmed) {
      throw new Error('Player name cannot be empty')
    }
    return new Player(PlayerId.generate(), trimmed, null)
  }

  static hydrate(id: PlayerId, name: string, skipFromRound: number | null): Player {
    return new Player(id, name, skipFromRound)
  }

  skipFrom(roundIndex: number): Player {
    return new Player(this.id, this.name, roundIndex)
  }

  isSkippedAt(roundIndex: number): boolean {
    return this.skipFromRound !== null && roundIndex >= this.skipFromRound
  }
}
