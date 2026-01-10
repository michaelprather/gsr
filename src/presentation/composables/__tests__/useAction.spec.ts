import { describe, it, expect, vi } from 'vitest'
import { useAction } from '../useAction'
import { ValidationError, Feedback } from '@/core'

describe('useAction', () => {
  it('starts in idle state', () => {
    const action = useAction(() => Promise.resolve('result'))

    expect(action.state.value.isIdle).toBe(true)
  })

  it('transitions to pending during execution', async () => {
    let resolve: (value: string) => void
    const promise = new Promise<string>((r) => {
      resolve = r
    })

    const action = useAction(() => promise)
    const executePromise = action.execute()

    expect(action.state.value.isPending).toBe(true)

    resolve!('result')
    await executePromise
  })

  it('transitions to success on successful execution', async () => {
    const action = useAction(() => Promise.resolve('result'))

    const success = await action.execute()

    expect(success).toBe(true)
    expect(action.state.value.isSuccess).toBe(true)
    expect(action.state.value.data).toBe('result')
  })

  it('transitions to failed on error', async () => {
    const error = new Error('Something went wrong')
    const action = useAction(() => Promise.reject(error))

    const success = await action.execute()

    expect(success).toBe(false)
    expect(action.state.value.isFailed).toBe(true)
    expect(action.state.value.error).toBe(error)
  })

  it('transitions to invalid on ValidationError', async () => {
    const feedback = Feedback.fromRecord({ field: ['Invalid value'] })
    const action = useAction(() => Promise.reject(new ValidationError(feedback)))

    const success = await action.execute()

    expect(success).toBe(false)
    expect(action.state.value.isInvalid).toBe(true)
    expect(action.state.value.feedback?.get('field')).toEqual(['Invalid value'])
  })

  it('resets to idle state', async () => {
    const action = useAction(() => Promise.resolve('result'))

    await action.execute()
    expect(action.state.value.isSuccess).toBe(true)

    action.reset()
    expect(action.state.value.isIdle).toBe(true)
  })

  it('calls action function on execute', async () => {
    const actionFn = vi.fn().mockResolvedValue('result')
    const action = useAction(actionFn)

    await action.execute()

    expect(actionFn).toHaveBeenCalledOnce()
  })

  it('can execute multiple times', async () => {
    let counter = 0
    const action = useAction(() => Promise.resolve(++counter))

    await action.execute()
    expect(action.state.value.data).toBe(1)

    await action.execute()
    expect(action.state.value.data).toBe(2)
  })
})
