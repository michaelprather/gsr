import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseSwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe(elementRef: Ref<HTMLElement | null>, options: UseSwipeOptions = {}) {
  const { threshold = 50, onSwipeLeft, onSwipeRight } = options

  const touchStartX = ref(0)
  const touchEndX = ref(0)

  function handleTouchStart(e: TouchEvent) {
    touchStartX.value = e.changedTouches[0]?.clientX ?? 0
    touchEndX.value = touchStartX.value
  }

  function handleTouchMove(e: TouchEvent) {
    touchEndX.value = e.changedTouches[0]?.clientX ?? 0
  }

  function handleTouchEnd() {
    const diff = touchStartX.value - touchEndX.value

    if (Math.abs(diff) < threshold) {
      return
    }

    if (diff > 0) {
      // Swiped left
      onSwipeLeft?.()
    } else {
      // Swiped right
      onSwipeRight?.()
    }
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return

    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
  })
}
