import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

describe('useOnlineStatus', () => {
  const originalNavigator = global.navigator
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>
  let eventHandlers: Map<string, () => void>

  beforeEach(() => {
    vi.resetModules()
    eventHandlers = new Map()

    addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      eventHandlers.set(event as string, handler as () => void)
    })

    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation((event) => {
      eventHandlers.delete(event as string)
    })
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('initializes with navigator.onLine value when online', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    })

    const { useOnlineStatus } = await import('../useOnlineStatus')
    const { isOnline } = useOnlineStatus()

    expect(isOnline.value).toBe(true)
  })

  it('initializes with navigator.onLine value when offline', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      writable: true,
    })

    const { useOnlineStatus } = await import('../useOnlineStatus')
    const { isOnline } = useOnlineStatus()

    expect(isOnline.value).toBe(false)
  })

  it('defaults to true when navigator is undefined', async () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
    })

    const { useOnlineStatus } = await import('../useOnlineStatus')
    const { isOnline } = useOnlineStatus()

    expect(isOnline.value).toBe(true)
  })

  it('registers event listeners on mount', async () => {
    const { mount } = await import('@vue/test-utils')
    const { defineComponent, h } = await import('vue')
    const { useOnlineStatus } = await import('../useOnlineStatus')

    const TestComponent = defineComponent({
      setup() {
        useOnlineStatus()
        return () => h('div')
      },
    })

    mount(TestComponent)
    await flushPromises()

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('removes event listeners on unmount', async () => {
    const { mount } = await import('@vue/test-utils')
    const { defineComponent, h } = await import('vue')
    const { useOnlineStatus } = await import('../useOnlineStatus')

    const TestComponent = defineComponent({
      setup() {
        useOnlineStatus()
        return () => h('div')
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('updates to true on online event', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: false },
      writable: true,
    })

    const { mount } = await import('@vue/test-utils')
    const { defineComponent, h } = await import('vue')
    const { useOnlineStatus } = await import('../useOnlineStatus')

    let isOnlineRef: ReturnType<typeof useOnlineStatus>['isOnline']

    const TestComponent = defineComponent({
      setup() {
        const { isOnline } = useOnlineStatus()
        isOnlineRef = isOnline
        return () => h('div')
      },
    })

    mount(TestComponent)
    await flushPromises()

    expect(isOnlineRef!.value).toBe(false)

    eventHandlers.get('online')?.()

    expect(isOnlineRef!.value).toBe(true)
  })

  it('updates to false on offline event', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    })

    const { mount } = await import('@vue/test-utils')
    const { defineComponent, h } = await import('vue')
    const { useOnlineStatus } = await import('../useOnlineStatus')

    let isOnlineRef: ReturnType<typeof useOnlineStatus>['isOnline']

    const TestComponent = defineComponent({
      setup() {
        const { isOnline } = useOnlineStatus()
        isOnlineRef = isOnline
        return () => h('div')
      },
    })

    mount(TestComponent)
    await flushPromises()

    expect(isOnlineRef!.value).toBe(true)

    eventHandlers.get('offline')?.()

    expect(isOnlineRef!.value).toBe(false)
  })

  it('returns readonly ref', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    })

    const { useOnlineStatus } = await import('../useOnlineStatus')
    const { isOnline } = useOnlineStatus()

    // Readonly refs in Vue don't throw, they warn and don't update
    // @ts-expect-error - testing readonly behavior
    isOnline.value = false

    // Value should remain unchanged
    expect(isOnline.value).toBe(true)
  })
})
