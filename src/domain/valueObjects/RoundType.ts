export const ROUND_TYPES = [
  'twoBooks',
  'oneBookOneRun',
  'twoRuns',
  'twoBooksOneRun',
  'twoRunsOneBook',
  'threeBooks',
  'threeRunsAndOut',
] as const

export type RoundTypeName = (typeof ROUND_TYPES)[number]

const ROUND_DISPLAY_NAMES: Record<RoundTypeName, string> = {
  twoBooks: '2 Books',
  oneBookOneRun: '1 Book 1 Run',
  twoRuns: '2 Runs',
  twoBooksOneRun: '2 Books 1 Run',
  twoRunsOneBook: '2 Runs 1 Book',
  threeBooks: '3 Books',
  threeRunsAndOut: '3 Runs and Out',
}

export class RoundType {
  private constructor(readonly name: RoundTypeName) {}

  static fromName(name: RoundTypeName): RoundType {
    return new RoundType(name)
  }

  static all(): RoundType[] {
    return ROUND_TYPES.map((name) => new RoundType(name))
  }

  get displayName(): string {
    return ROUND_DISPLAY_NAMES[this.name]
  }

  equals(other: RoundType): boolean {
    return this.name === other.name
  }
}
