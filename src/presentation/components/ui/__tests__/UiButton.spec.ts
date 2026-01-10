import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '../UiButton.vue'

describe('UiButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiButton, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(UiButton)

    expect(wrapper.classes()).toContain('ui-button--primary')
  })

  it('applies secondary variant when specified', () => {
    const wrapper = mount(UiButton, {
      props: { variant: 'secondary' },
    })

    expect(wrapper.classes()).toContain('ui-button--secondary')
  })

  it('applies ghost variant when specified', () => {
    const wrapper = mount(UiButton, {
      props: { variant: 'ghost' },
    })

    expect(wrapper.classes()).toContain('ui-button--ghost')
  })

  it('applies destructive variant when specified', () => {
    const wrapper = mount(UiButton, {
      props: { variant: 'destructive' },
    })

    expect(wrapper.classes()).toContain('ui-button--destructive')
  })

  it('applies icon size class when specified', () => {
    const wrapper = mount(UiButton, {
      props: { size: 'icon' },
    })

    expect(wrapper.classes()).toContain('ui-button--icon')
  })

  it('applies small size class when specified', () => {
    const wrapper = mount(UiButton, {
      props: { size: 'small' },
    })

    expect(wrapper.classes()).toContain('ui-button--small')
  })

  it('applies block class when specified', () => {
    const wrapper = mount(UiButton, {
      props: { block: true },
    })

    expect(wrapper.classes()).toContain('ui-button--block')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(UiButton, {
      props: { disabled: true },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('is disabled when loading prop is true', () => {
    const wrapper = mount(UiButton, {
      props: { loading: true },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(UiButton)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(UiButton, {
      props: { disabled: true },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies aria-label when provided', () => {
    const wrapper = mount(UiButton, {
      props: { ariaLabel: 'Close dialog' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Close dialog')
  })

  it('has type="button" by default', () => {
    const wrapper = mount(UiButton)

    expect(wrapper.attributes('type')).toBe('button')
  })

  it('can set type to submit', () => {
    const wrapper = mount(UiButton, {
      props: { type: 'submit' },
    })

    expect(wrapper.attributes('type')).toBe('submit')
  })
})
