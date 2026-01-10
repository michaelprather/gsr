import { PlayerId } from '../valueObjects'

export class Player {
  private constructor(
    readonly id: PlayerId,
    readonly name: string,
  ) {}

  static create(name: string): Player {
    const trimmed = name.trim()
    if (!trimmed) {
      throw new Error('Player name cannot be empty')
    }
    return new Player(PlayerId.generate(), trimmed)
  }

  static hydrate(id: PlayerId, name: string): Player {
    return new Player(id, name)
  }
}
