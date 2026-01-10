import type { Feedback } from './Feedback'

export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(readonly feedback: Feedback) {
    super('Validation failed')
  }
}
