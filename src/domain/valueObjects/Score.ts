export class Score {
  private constructor(readonly value: number) {}

  static create(value: number): Score {
    if (value < 0 || value > 300 || value % 5 !== 0) {
      throw new Error(`Invalid score: ${value}. Must be 0-300 and divisible by 5.`)
    }
    return new Score(value)
  }

  static zero(): Score {
    return new Score(0)
  }

  equals(other: Score): boolean {
    return this.value === other.value
  }
}
