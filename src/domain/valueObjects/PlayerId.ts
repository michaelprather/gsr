import { AppError } from '@/core'

export class PlayerId {
  private constructor(readonly value: string) {}

  static create(value: string): PlayerId {
    if (!value.trim()) {
      throw new AppError('PlayerId cannot be empty')
    }
    return new PlayerId(value)
  }

  static generate(): PlayerId {
    return new PlayerId(crypto.randomUUID())
  }

  equals(other: PlayerId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
