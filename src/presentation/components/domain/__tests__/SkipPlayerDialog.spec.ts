import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkipPlayerDialog from '../SkipPlayerDialog.vue'

describe('SkipPlayerDialog', () => {
  const defaultProps = {
    open: true,
    playerName: 'Alice',
  }

  it('renders when open is true', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    expect(wrapper.find('.ui-dialog').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: {
        ...defaultProps,
        open: false,
      },
    })

    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
  })

  it('displays title with player name', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    expect(wrapper.find('.ui-dialog__title').text()).toBe('Skip Alice')
  })

  it('displays skip this round option', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    const options = wrapper.findAll('.skip-player-dialog__option')
    expect(options[0]!.text()).toContain('Skip this round')
  })

  it('displays skip rest of game option', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    const options = wrapper.findAll('.skip-player-dialog__option')
    expect(options[1]!.text()).toContain('Skip rest of game')
  })

  it('emits skip-round when skip this round is clicked', async () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    const options = wrapper.findAll('.skip-player-dialog__option')
    await options[0]!.trigger('click')

    expect(wrapper.emitted('skip-round')).toHaveLength(1)
  })

  it('emits skip-all when skip rest of game is clicked', async () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    const options = wrapper.findAll('.skip-player-dialog__option')
    await options[1]!.trigger('click')

    expect(wrapper.emitted('skip-all')).toHaveLength(1)
  })

  it('emits close when cancel button is clicked', async () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    await wrapper.find('.ui-button--secondary').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    await wrapper.find('.ui-dialog').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when panel is clicked', async () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    await wrapper.find('.ui-dialog__panel').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close when Escape key is pressed', async () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    await wrapper.find('.ui-dialog').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('has proper accessibility attributes on dialog', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    const dialog = wrapper.find('.ui-dialog')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBeTruthy()
  })

  it('associates aria-labelledby with title', () => {
    const wrapper = mount(SkipPlayerDialog, {
      props: defaultProps,
    })

    const dialog = wrapper.find('.ui-dialog')
    const title = wrapper.find('.ui-dialog__title')

    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
  })
})
