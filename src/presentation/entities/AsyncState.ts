import type { Feedback } from '@/core'

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'failed' | 'invalid'

export class AsyncState<T> {
  private constructor(
    readonly status: AsyncStatus,
    readonly data: T | undefined,
    readonly error: Error | undefined,
    readonly feedback: Feedback | undefined,
  ) {}

  static idle<T>(): AsyncState<T> {
    return new AsyncState<T>('idle', undefined, undefined, undefined)
  }

  get isIdle(): boolean {
    return this.status === 'idle'
  }

  get isPending(): boolean {
    return this.status === 'pending'
  }

  get isSuccess(): boolean {
    return this.status === 'success'
  }

  get isFailed(): boolean {
    return this.status === 'failed'
  }

  get isInvalid(): boolean {
    return this.status === 'invalid'
  }

  pending(): AsyncState<T> {
    return new AsyncState<T>('pending', undefined, undefined, undefined)
  }

  success(data: T): AsyncState<T> {
    return new AsyncState<T>('success', data, undefined, undefined)
  }

  failed(error: Error): AsyncState<T> {
    return new AsyncState<T>('failed', undefined, error, undefined)
  }

  invalid(feedback: Feedback): AsyncState<T> {
    return new AsyncState<T>('invalid', undefined, undefined, feedback)
  }
}
