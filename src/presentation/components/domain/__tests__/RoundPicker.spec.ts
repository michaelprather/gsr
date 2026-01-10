import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoundPicker from '../RoundPicker.vue'
import { Round, RoundType } from '@/domain'

describe('RoundPicker', () => {
  function createMockRounds(): Round[] {
    return RoundType.all().map((type) => Round.create(type))
  }

  const defaultProps = {
    open: true,
    rounds: createMockRounds(),
    currentIndex: 0,
  }

  it('renders when open is true', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    expect(wrapper.find('.round-picker').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(RoundPicker, {
      props: {
        ...defaultProps,
        open: false,
      },
    })

    expect(wrapper.find('.round-picker').exists()).toBe(false)
  })

  it('displays title', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    expect(wrapper.find('.round-picker__title').text()).toBe('Select Round')
  })

  it('renders all 7 rounds', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    const items = wrapper.findAll('.round-picker__item')
    expect(items).toHaveLength(7)
  })

  it('displays round type name for each round', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    const types = wrapper.findAll('.round-picker__item-type')
    expect(types[0]!.text()).toBe('2 Books')
    expect(types[1]!.text()).toBe('1 Book 1 Run')
    expect(types[6]!.text()).toBe('3 Runs and Out')
  })

  it('displays round number for each round', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    const numbers = wrapper.findAll('.round-picker__item-number')
    expect(numbers[0]!.text()).toBe('Round 1')
    expect(numbers[6]!.text()).toBe('Round 7')
  })

  it('marks current round as active', () => {
    const wrapper = mount(RoundPicker, {
      props: {
        ...defaultProps,
        currentIndex: 2,
      },
    })

    const items = wrapper.findAll('.round-picker__item')
    expect(items[2]!.classes()).toContain('round-picker__item--active')
    expect(items[0]!.classes()).not.toContain('round-picker__item--active')
  })

  it('emits select with index when round is clicked', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    const items = wrapper.findAll('.round-picker__item')
    await items[3]!.trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([3])
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    await wrapper.find('.round-picker').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when panel is clicked', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    await wrapper.find('.round-picker__panel').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close when Escape key is pressed', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    await wrapper.find('.round-picker').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('shows lock icon for locked rounds', () => {
    const rounds = createMockRounds()
    const lockedRounds = [rounds[0]!.lock(), rounds[1]!.lock(), ...rounds.slice(2)]

    const wrapper = mount(RoundPicker, {
      props: {
        ...defaultProps,
        rounds: lockedRounds,
      },
    })

    const statusIcons = wrapper.findAll('.round-picker__item-status')
    expect(statusIcons).toHaveLength(2)
  })

  it('has proper accessibility attributes on dialog', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    const dialog = wrapper.find('.round-picker')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBeTruthy()
  })

  it('has proper accessibility attributes on list', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
    })

    const list = wrapper.find('.round-picker__list')
    expect(list.attributes('role')).toBe('listbox')
  })

  it('marks selected round with aria-selected', () => {
    const wrapper = mount(RoundPicker, {
      props: {
        ...defaultProps,
        currentIndex: 1,
      },
    })

    const items = wrapper.findAll('.round-picker__item')
    expect(items[1]!.attributes('aria-selected')).toBe('true')
    expect(items[0]!.attributes('aria-selected')).toBe('false')
  })
})
