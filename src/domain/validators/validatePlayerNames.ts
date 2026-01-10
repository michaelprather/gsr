import { Feedback } from '@/core'

export function validatePlayerNames(names: string[]): Feedback {
  const errors: string[] = []

  if (names.length < 2) {
    errors.push('At least 2 players required')
  }

  if (names.length > 8) {
    errors.push('Maximum 8 players allowed')
  }

  const trimmed = names.map((n) => n.trim())
  const empty = trimmed.filter((n) => n.length === 0)
  if (empty.length > 0) {
    errors.push('Player names cannot be empty')
  }

  const unique = new Set(trimmed.map((n) => n.toLowerCase()))
  if (unique.size !== trimmed.length) {
    errors.push('Player names must be unique')
  }

  return Feedback.fromRecord({ players: errors })
}
