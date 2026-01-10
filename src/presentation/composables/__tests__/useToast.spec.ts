import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '../useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear any existing toasts
    const { toasts, dismiss } = useToast()
    toasts.value.forEach((t) => dismiss(t.id))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with empty toasts array', () => {
    const { toasts } = useToast()

    expect(toasts.value).toHaveLength(0)
  })

  it('adds toast via show()', () => {
    const { toasts, show } = useToast()

    show({ message: 'Test message' })

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.message).toBe('Test message')
  })

  it('returns the created toast from show()', () => {
    const { show } = useToast()

    const toast = show({ message: 'Test message', variant: 'error' })

    expect(toast.message).toBe('Test message')
    expect(toast.variant).toBe('error')
    expect(toast.id).toBeDefined()
  })

  it('adds toast via info() helper', () => {
    const { toasts, info } = useToast()

    info('Info message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.variant).toBe('info')
  })

  it('adds toast via success() helper', () => {
    const { toasts, success } = useToast()

    success('Success message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.variant).toBe('success')
  })

  it('adds toast via error() helper', () => {
    const { toasts, error } = useToast()

    error('Error message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.variant).toBe('error')
  })

  it('dismisses toast by id', () => {
    const { toasts, show, dismiss } = useToast()

    const toast = show({ message: 'Test' })
    expect(toasts.value).toHaveLength(1)

    dismiss(toast.id)

    expect(toasts.value).toHaveLength(0)
  })

  it('stacks multiple toasts', () => {
    const { toasts, info, error } = useToast()

    info('First')
    error('Second')
    info('Third')

    expect(toasts.value).toHaveLength(3)
    expect(toasts.value[0]!.message).toBe('First')
    expect(toasts.value[1]!.message).toBe('Second')
    expect(toasts.value[2]!.message).toBe('Third')
  })

  it('auto-dismisses after duration elapses', () => {
    const { toasts, info } = useToast()

    info('Auto dismiss', 1000)
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(999)
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(toasts.value).toHaveLength(0)
  })

  it('uses default duration based on variant', () => {
    const { toasts, error, info } = useToast()

    // Info defaults to 3000ms
    info('Info toast')
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(3000)
    expect(toasts.value).toHaveLength(0)

    // Error defaults to 5000ms
    error('Error toast')
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(4999)
    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(toasts.value).toHaveLength(0)
  })

  it('allows custom duration override', () => {
    const { toasts, info } = useToast()

    info('Custom duration', 500)

    vi.advanceTimersByTime(500)
    expect(toasts.value).toHaveLength(0)
  })

  it('clears timer when manually dismissed', () => {
    const { toasts, show, dismiss } = useToast()

    const toast = show({ message: 'Test', duration: 5000 })
    dismiss(toast.id)

    // Advancing time should not cause errors
    vi.advanceTimersByTime(10000)
    expect(toasts.value).toHaveLength(0)
  })

  it('dismisses only the specified toast', () => {
    const { toasts, info, dismiss } = useToast()

    const first = info('First')
    info('Second')
    info('Third')

    dismiss(first.id)

    expect(toasts.value).toHaveLength(2)
    expect(toasts.value[0]!.message).toBe('Second')
    expect(toasts.value[1]!.message).toBe('Third')
  })

  it('shares state across multiple useToast() calls', () => {
    const toast1 = useToast()
    const toast2 = useToast()

    toast1.info('From first')

    expect(toast2.toasts.value).toHaveLength(1)
    expect(toast2.toasts.value[0]!.message).toBe('From first')
  })
})
