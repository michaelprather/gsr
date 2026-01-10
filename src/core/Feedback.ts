export class Feedback {
  private constructor(private readonly errors: ReadonlyMap<string, readonly string[]>) {}

  static empty(): Feedback {
    return new Feedback(new Map())
  }

  static fromRecord(errors: Record<string, string[]>): Feedback {
    const filtered = new Map<string, readonly string[]>()
    for (const [field, messages] of Object.entries(errors)) {
      const nonEmpty = messages.filter((m) => m.length > 0)
      if (nonEmpty.length > 0) {
        filtered.set(field, nonEmpty)
      }
    }
    return new Feedback(filtered)
  }

  get(field: string): readonly string[] | undefined {
    return this.errors.get(field)
  }

  get hasFeedback(): boolean {
    return this.errors.size > 0
  }

  get fields(): string[] {
    return Array.from(this.errors.keys())
  }

  merge(other: Feedback): Feedback {
    const merged = new Map(this.errors)
    for (const [field, messages] of other.errors) {
      const existing = merged.get(field) ?? []
      merged.set(field, [...existing, ...messages])
    }
    return new Feedback(merged)
  }
}
