import { describe, it, expect } from 'vitest'
import { AsyncState } from '../AsyncState'
import { Feedback } from '@/core'

describe('AsyncState', () => {
  describe('idle', () => {
    it('creates idle state', () => {
      const state = AsyncState.idle<string>()

      expect(state.status).toBe('idle')
      expect(state.isIdle).toBe(true)
      expect(state.isPending).toBe(false)
      expect(state.isSuccess).toBe(false)
      expect(state.isFailed).toBe(false)
      expect(state.isInvalid).toBe(false)
      expect(state.data).toBeUndefined()
      expect(state.error).toBeUndefined()
      expect(state.feedback).toBeUndefined()
    })
  })

  describe('pending', () => {
    it('transitions to pending state', () => {
      const state = AsyncState.idle<string>().pending()

      expect(state.status).toBe('pending')
      expect(state.isPending).toBe(true)
      expect(state.isIdle).toBe(false)
      expect(state.data).toBeUndefined()
    })
  })

  describe('success', () => {
    it('transitions to success state with data', () => {
      const state = AsyncState.idle<string>().pending().success('result')

      expect(state.status).toBe('success')
      expect(state.isSuccess).toBe(true)
      expect(state.data).toBe('result')
      expect(state.error).toBeUndefined()
      expect(state.feedback).toBeUndefined()
    })

    it('preserves complex data types', () => {
      const data = { id: 1, name: 'test' }
      const state = AsyncState.idle<typeof data>().success(data)

      expect(state.data).toEqual({ id: 1, name: 'test' })
    })
  })

  describe('failed', () => {
    it('transitions to failed state with error', () => {
      const error = new Error('Something went wrong')
      const state = AsyncState.idle<string>().pending().failed(error)

      expect(state.status).toBe('failed')
      expect(state.isFailed).toBe(true)
      expect(state.error).toBe(error)
      expect(state.error?.message).toBe('Something went wrong')
      expect(state.data).toBeUndefined()
    })
  })

  describe('invalid', () => {
    it('transitions to invalid state with feedback', () => {
      const feedback = Feedback.fromRecord({ name: ['Name is required'] })
      const state = AsyncState.idle<string>().pending().invalid(feedback)

      expect(state.status).toBe('invalid')
      expect(state.isInvalid).toBe(true)
      expect(state.feedback).toBe(feedback)
      expect(state.feedback?.get('name')).toEqual(['Name is required'])
      expect(state.data).toBeUndefined()
      expect(state.error).toBeUndefined()
    })
  })

  describe('immutability', () => {
    it('returns new instance on each transition', () => {
      const idle = AsyncState.idle<string>()
      const pending = idle.pending()
      const success = pending.success('result')

      expect(idle.status).toBe('idle')
      expect(pending.status).toBe('pending')
      expect(success.status).toBe('success')
    })
  })
})
