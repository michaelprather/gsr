import { ref, readonly, onMounted, onUnmounted } from 'vue'

export type Orientation = 'portrait' | 'landscape'

export function useOrientation() {
  const orientation = ref<Orientation>(getOrientation())

  function getOrientation(): Orientation {
    if (typeof window === 'undefined') return 'portrait'
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }

  function handleResize() {
    orientation.value = getOrientation()
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    orientation: readonly(orientation),
  }
}
