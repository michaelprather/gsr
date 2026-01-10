import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiConfirmDialog from '../UiConfirmDialog.vue'

describe('UiConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  }

  const mountOptions = {
    global: {
      stubs: {
        Teleport: true,
      },
    },
  }

  it('renders when open is true', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: {
        ...defaultProps,
        open: false,
      },
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
  })

  it('displays title', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.ui-dialog__title').text()).toBe('Confirm Action')
  })

  it('displays message', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.ui-confirm-dialog__message').text()).toBe(
      'Are you sure you want to proceed?',
    )
  })

  it('uses default button labels', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.text()).toBe('Cancel')
    expect(buttons[1]!.text()).toBe('Confirm')
  })

  it('uses custom button labels', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: {
        ...defaultProps,
        confirmLabel: 'Delete',
        cancelLabel: 'Keep',
      },
      ...mountOptions,
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.text()).toBe('Keep')
    expect(buttons[1]!.text()).toBe('Delete')
  })

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits cancel when backdrop is clicked', async () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('.ui-dialog').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('does not emit cancel when panel is clicked', async () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('.ui-dialog__panel').trigger('click')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('emits cancel when Escape key is pressed', async () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('.ui-dialog').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    const dialog = wrapper.find('.ui-dialog')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBeTruthy()
  })

  it('associates aria-labelledby with title', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: defaultProps,
      ...mountOptions,
    })

    const dialog = wrapper.find('.ui-dialog')
    const title = wrapper.find('.ui-dialog__title')

    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
  })

  it('applies destructive variant to confirm button when destructive is true', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: {
        ...defaultProps,
        destructive: true,
      },
      ...mountOptions,
    })

    const confirmButton = wrapper.findAll('button')[1]!
    expect(confirmButton.classes()).toContain('ui-button--destructive')
  })

  it('applies primary variant to confirm button when destructive is false', () => {
    const wrapper = mount(UiConfirmDialog, {
      props: {
        ...defaultProps,
        destructive: false,
      },
      ...mountOptions,
    })

    const confirmButton = wrapper.findAll('button')[1]!
    expect(confirmButton.classes()).toContain('ui-button--primary')
  })
})
