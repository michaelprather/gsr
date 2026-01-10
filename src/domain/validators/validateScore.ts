import { Feedback } from '@/core'

export function validateScore(value: number): Feedback {
  const errors: string[] = []

  if (value < 0) {
    errors.push('Score must be at least 0')
  }

  if (value > 300) {
    errors.push('Score must be at most 300')
  }

  if (value % 5 !== 0) {
    errors.push('Score must be divisible by 5')
  }

  return Feedback.fromRecord({ score: errors })
}
