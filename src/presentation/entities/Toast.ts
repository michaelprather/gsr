export type ToastVariant = 'info' | 'success' | 'error'

export interface ToastOptions {
  message: string
  variant?: ToastVariant
  duration?: number
}

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  info: 3000,
  success: 3000,
  error: 5000,
}

let toastId = 0

export class Toast {
  readonly id: number
  readonly message: string
  readonly variant: ToastVariant
  readonly duration: number

  constructor(options: ToastOptions) {
    this.id = ++toastId
    this.message = options.message
    this.variant = options.variant ?? 'info'
    this.duration = options.duration ?? DEFAULT_DURATIONS[this.variant]
  }
}
