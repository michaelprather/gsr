import { ref, readonly, type Ref, type DeepReadonly } from 'vue'
import { ValidationError } from '@/core'
import { AsyncState } from '../entities'

export interface UseActionReturn<T> {
  state: DeepReadonly<Ref<AsyncState<T>>>
  execute: () => Promise<boolean>
  reset: () => void
}

export function useAction<T>(action: () => Promise<T>): UseActionReturn<T> {
  const state = ref(AsyncState.idle<T>()) as Ref<AsyncState<T>>

  async function execute(): Promise<boolean> {
    state.value = state.value.pending()
    try {
      const result = await action()
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
    state.value = AsyncState.idle<T>()
  }

  return {
    state: readonly(state),
    execute,
    reset,
  }
}
