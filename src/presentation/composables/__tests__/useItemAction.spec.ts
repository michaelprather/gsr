import { describe, it, expect, vi } from 'vitest'
import { useItemAction } from '../useItemAction'
import { ValidationError, Feedback } from '@/core'

describe('useItemAction', () => {
  it('starts in idle state with no active id', () => {
    const action = useItemAction((id: string) => Promise.resolve(id))

    expect(action.state.value.isIdle).toBe(true)
    expect(action.activeId.value).toBeNull()
  })

  it('sets activeId during execution', async () => {
    let resolve: (value: string) => void
    const promise = new Promise<string>((r) => {
      resolve = r
    })

    const action = useItemAction((_id: string) => promise)
    const executePromise = action.execute('item-123')

    expect(action.activeId.value).toBe('item-123')
    expect(action.state.value.isPending).toBe(true)

    resolve!('result')
    await executePromise
  })

  it('transitions to success on successful execution', async () => {
    const action = useItemAction((id: string) => Promise.resolve(`processed-${id}`))

    const success = await action.execute('item-456')

    expect(success).toBe(true)
    expect(action.state.value.isSuccess).toBe(true)
    expect(action.state.value.data).toBe('processed-item-456')
    expect(action.activeId.value).toBe('item-456')
  })

  it('transitions to failed on error', async () => {
    const error = new Error('Delete failed')
    const action = useItemAction((_id: string) => Promise.reject(error))

    const success = await action.execute('item-789')

    expect(success).toBe(false)
    expect(action.state.value.isFailed).toBe(true)
    expect(action.state.value.error).toBe(error)
    expect(action.activeId.value).toBe('item-789')
  })

  it('transitions to invalid on ValidationError', async () => {
    const feedback = Feedback.fromRecord({ id: ['Cannot delete'] })
    const action = useItemAction((_id: string) => Promise.reject(new ValidationError(feedback)))

    const success = await action.execute('item-999')

    expect(success).toBe(false)
    expect(action.state.value.isInvalid).toBe(true)
    expect(action.state.value.feedback?.get('id')).toEqual(['Cannot delete'])
  })

  it('resets state and activeId', async () => {
    const action = useItemAction((id: string) => Promise.resolve(id))

    await action.execute('item-123')
    expect(action.state.value.isSuccess).toBe(true)
    expect(action.activeId.value).toBe('item-123')

    action.reset()
    expect(action.state.value.isIdle).toBe(true)
    expect(action.activeId.value).toBeNull()
  })

  it('passes id to action function', async () => {
    const actionFn = vi.fn().mockResolvedValue('result')
    const action = useItemAction(actionFn)

    await action.execute('my-item-id')

    expect(actionFn).toHaveBeenCalledWith('my-item-id')
  })

  it('updates activeId on subsequent executions', async () => {
    const action = useItemAction((id: string) => Promise.resolve(id))

    await action.execute('first')
    expect(action.activeId.value).toBe('first')

    await action.execute('second')
    expect(action.activeId.value).toBe('second')
  })

  it('works with numeric ids', async () => {
    const action = useItemAction((id: number) => Promise.resolve(id * 2))

    await action.execute(5)

    expect(action.activeId.value).toBe(5)
    expect(action.state.value.data).toBe(10)
  })
})
