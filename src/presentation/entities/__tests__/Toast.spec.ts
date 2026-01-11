import { describe, it, expect } from 'vitest'
import { Toast } from '../Toast'

describe('Toast', () => {
  it('creates toast with message', () => {
    const toast = new Toast({ message: 'Test message' })

    expect(toast.message).toBe('Test message')
  })

  it('assigns unique id to each toast', () => {
    const toast1 = new Toast({ message: 'First' })
    const toast2 = new Toast({ message: 'Second' })

    expect(toast1.id).not.toBe(toast2.id)
  })

  it('defaults variant to info', () => {
    const toast = new Toast({ message: 'Test' })

    expect(toast.variant).toBe('info')
  })

  it('accepts custom variant', () => {
    const toast = new Toast({ message: 'Test', variant: 'error' })

    expect(toast.variant).toBe('error')
  })

  it('uses default duration for info variant (3000ms)', () => {
    const toast = new Toast({ message: 'Test', variant: 'info' })

    expect(toast.duration).toBe(3000)
  })

  it('uses default duration for success variant (3000ms)', () => {
    const toast = new Toast({ message: 'Test', variant: 'success' })

    expect(toast.duration).toBe(3000)
  })

  it('uses default duration for error variant (5000ms)', () => {
    const toast = new Toast({ message: 'Test', variant: 'error' })

    expect(toast.duration).toBe(5000)
  })

  it('accepts custom duration', () => {
    const toast = new Toast({ message: 'Test', duration: 1500 })

    expect(toast.duration).toBe(1500)
  })

  it('custom duration overrides variant default', () => {
    const toast = new Toast({ message: 'Test', variant: 'error', duration: 1000 })

    expect(toast.duration).toBe(1000)
  })
})
