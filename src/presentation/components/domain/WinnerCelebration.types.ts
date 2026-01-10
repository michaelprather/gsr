export interface Winner {
  readonly name: string
  readonly score: number
}

export interface WinnerCelebrationProps {
  readonly winners: Winner[]
}
