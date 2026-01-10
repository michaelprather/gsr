import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

describe('useTheme', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()

    mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    })

    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('initializes with default theme when no preference', async () => {
    mockMatchMedia.mockReturnValue({ matches: false })

    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        const { current } = useTheme()
        return { current }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    expect(wrapper.vm.current).toBe('default')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('initializes with contrast theme when prefers-contrast: more', async () => {
    mockMatchMedia.mockReturnValue({ matches: true })

    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        const { current } = useTheme()
        return { current }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    expect(wrapper.vm.current).toBe('contrast')
    expect(document.documentElement.getAttribute('data-theme')).toBe('contrast')
  })

  it('queries media with prefers-contrast: more', async () => {
    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        useTheme()
        return () => h('div')
      },
    })

    mount(TestComponent)
    await flushPromises()

    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: more)')
  })

  it('only initializes once across multiple useTheme calls', async () => {
    mockMatchMedia.mockReturnValue({ matches: true })

    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        const theme1 = useTheme()
        const theme2 = useTheme()
        return { current1: theme1.current, current2: theme2.current }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    expect(wrapper.vm.current1).toBe('contrast')
    expect(wrapper.vm.current2).toBe('contrast')
    expect(wrapper.vm.current1).toBe(wrapper.vm.current2)
  })

  it('shares state between multiple components', async () => {
    mockMatchMedia.mockReturnValue({ matches: true })

    const { useTheme } = await import('../useTheme')

    const TestComponent1 = defineComponent({
      setup() {
        const { current } = useTheme()
        return { current }
      },
      render() {
        return h('div')
      },
    })

    const TestComponent2 = defineComponent({
      setup() {
        const { current } = useTheme()
        return { current }
      },
      render() {
        return h('div')
      },
    })

    const wrapper1 = mount(TestComponent1)
    await flushPromises()
    const wrapper2 = mount(TestComponent2)
    await flushPromises()

    expect(wrapper1.vm.current).toBe('contrast')
    expect(wrapper2.vm.current).toBe('contrast')
  })

  it('returns readonly current ref', async () => {
    mockMatchMedia.mockReturnValue({ matches: false })

    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        const { current } = useTheme()
        return { current }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    // Readonly refs in Vue don't throw, they warn and don't update
    wrapper.vm.current = 'contrast'

    // Value should remain unchanged
    expect(wrapper.vm.current).toBe('default')
  })

  it('sets data-theme attribute for contrast theme', async () => {
    mockMatchMedia.mockReturnValue({ matches: true })

    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        useTheme()
        return () => h('div')
      },
    })

    mount(TestComponent)
    await flushPromises()

    expect(document.documentElement.getAttribute('data-theme')).toBe('contrast')
  })

  it('removes data-theme attribute for default theme', async () => {
    document.documentElement.setAttribute('data-theme', 'contrast')
    mockMatchMedia.mockReturnValue({ matches: false })

    const { useTheme } = await import('../useTheme')

    const TestComponent = defineComponent({
      setup() {
        useTheme()
        return () => h('div')
      },
    })

    mount(TestComponent)
    await flushPromises()

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
