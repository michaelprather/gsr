import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiDialog from '../UiDialog.vue'

describe('UiDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Dialog Title',
  }

  const mountOptions = {
    global: {
      stubs: {
        Teleport: true,
      },
    },
  }

  it('renders when open is true', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Dialog content',
      },
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(UiDialog, {
      props: {
        ...defaultProps,
        open: false,
      },
      slots: {
        default: 'Dialog content',
      },
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
  })

  it('displays title', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Dialog content',
      },
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog__title').text()).toBe('Dialog Title')
  })

  it('renders default slot content', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: '<p class="test-content">Test content</p>',
      },
      ...mountOptions,
    })

    expect(wrapper.find('.test-content').text()).toBe('Test content')
  })

  it('renders actions slot when provided', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
        actions: '<button class="test-action">Action</button>',
      },
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog__actions').exists()).toBe(true)
    expect(wrapper.find('.test-action').text()).toBe('Action')
  })

  it('does not render actions container when slot is empty', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
      },
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog__actions').exists()).toBe(false)
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
      },
      ...mountOptions,
    })

    await wrapper.find('.ui-dialog').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when panel is clicked', async () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
      },
      ...mountOptions,
    })

    await wrapper.find('.ui-dialog__panel').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close when Escape key is pressed', async () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
      },
      ...mountOptions,
    })

    await wrapper.find('.ui-dialog').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
      },
      ...mountOptions,
    })

    const dialog = wrapper.find('.ui-dialog')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBeTruthy()
  })

  it('associates aria-labelledby with title', () => {
    const wrapper = mount(UiDialog, {
      props: defaultProps,
      slots: {
        default: 'Content',
      },
      ...mountOptions,
    })

    const dialog = wrapper.find('.ui-dialog')
    const title = wrapper.find('.ui-dialog__title')

    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
  })
})
