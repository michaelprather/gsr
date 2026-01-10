import { describe, it, expect, vi } from 'vitest'
import { ref, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useSwipe, type UseSwipeOptions } from '../useSwipe'

function createTouchEvent(type: string, clientX: number): TouchEvent {
  return new TouchEvent(type, {
    changedTouches: [{ clientX } as Touch],
  })
}

function mountSwipeWrapper(options: UseSwipeOptions) {
  const elementRef = ref<HTMLElement | null>(null)

  const TestComponent = defineComponent({
    setup() {
      useSwipe(elementRef, options)
      return { elementRef }
    },
    render() {
      return h('div', { ref: 'elementRef' })
    },
  })

  const wrapper = mount(TestComponent)
  const element = wrapper.element as HTMLElement
  return { wrapper, element }
}

describe('useSwipe', () => {
  it('calls onSwipeLeft when swiping left beyond threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    const { element } = mountSwipeWrapper({
      onSwipeLeft,
      onSwipeRight,
      threshold: 50,
    })

    element.dispatchEvent(createTouchEvent('touchstart', 200))
    element.dispatchEvent(createTouchEvent('touchmove', 100))
    element.dispatchEvent(createTouchEvent('touchend', 100))

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('calls onSwipeRight when swiping right beyond threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    const { element } = mountSwipeWrapper({
      onSwipeLeft,
      onSwipeRight,
      threshold: 50,
    })

    element.dispatchEvent(createTouchEvent('touchstart', 100))
    element.dispatchEvent(createTouchEvent('touchmove', 200))
    element.dispatchEvent(createTouchEvent('touchend', 200))

    expect(onSwipeRight).toHaveBeenCalledOnce()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('does not call handlers when swipe distance is below threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()

    const { element } = mountSwipeWrapper({
      onSwipeLeft,
      onSwipeRight,
      threshold: 50,
    })

    element.dispatchEvent(createTouchEvent('touchstart', 100))
    element.dispatchEvent(createTouchEvent('touchmove', 130))
    element.dispatchEvent(createTouchEvent('touchend', 130))

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('uses default threshold of 50', () => {
    const onSwipeLeft = vi.fn()

    const { element } = mountSwipeWrapper({ onSwipeLeft })

    // Swipe of 49px should not trigger
    element.dispatchEvent(createTouchEvent('touchstart', 100))
    element.dispatchEvent(createTouchEvent('touchmove', 51))
    element.dispatchEvent(createTouchEvent('touchend', 51))

    expect(onSwipeLeft).not.toHaveBeenCalled()

    // Swipe of 51px should trigger
    element.dispatchEvent(createTouchEvent('touchstart', 100))
    element.dispatchEvent(createTouchEvent('touchmove', 49))
    element.dispatchEvent(createTouchEvent('touchend', 49))

    expect(onSwipeLeft).toHaveBeenCalledOnce()
  })

  it('handles null element ref gracefully', () => {
    const onSwipeLeft = vi.fn()

    // Mount with a component that never assigns the ref
    const TestComponent = defineComponent({
      setup() {
        const elementRef = ref<HTMLElement | null>(null)
        useSwipe(elementRef, { onSwipeLeft })
        return {}
      },
      render() {
        return h('div') // No ref assigned
      },
    })

    // Should not throw
    expect(() => mount(TestComponent)).not.toThrow()
  })
})
