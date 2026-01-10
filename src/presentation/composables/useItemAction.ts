import { ref, readonly, type Ref, type DeepReadonly } from 'vue'
import { ValidationError } from '@/core'
import { AsyncState } from '../entities'

export interface UseItemActionReturn<TId, TResult> {
  state: DeepReadonly<Ref<AsyncState<TResult>>>
  activeId: DeepReadonly<Ref<TId | null>>
  execute: (id: TId) => Promise<boolean>
  reset: () => void
}

export function useItemAction<TId, TResult>(
  action: (id: TId) => Promise<TResult>,
): UseItemActionReturn<TId, TResult> {
  const state = ref(AsyncState.idle<TResult>()) as Ref<AsyncState<TResult>>
  const activeId = ref<TId | null>(null) as Ref<TId | null>

  async function execute(id: TId): Promise<boolean> {
    activeId.value = id
    state.value = state.value.pending()
    try {
      const result = await action(id)
      state.value = state.value.success(result)
      return true
    } catch (e) {
      if (e instanceof ValidationError) {
        state.value = state.value.invalid(e.feedback)
      } else {
        state.value = state.value.failed(e as Error)
      }
      return false
    }
  }

  function reset(): void {
    state.value = AsyncState.idle<TResult>()
    activeId.value = null
  }

  return {
    state: readonly(state),
    activeId: readonly(activeId),
    execute,
    reset,
  }
}
