import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoundPicker from '../RoundPicker.vue'
import { Game, Round, RoundType, RoundScore, Score } from '@/domain'

describe('RoundPicker', () => {
  function createMockRounds(): Round[] {
    return RoundType.all().map((type) => Round.create(type))
  }

  function createMockPlayers() {
    const game = Game.create(['Alice', 'Bob'])
    return game.players
  }

  const defaultProps = {
    open: true,
    rounds: createMockRounds(),
    players: createMockPlayers(),
    currentIndex: 0,
  }

  const mountOptions = {
    global: {
      stubs: {
        Teleport: true,
      },
    },
  }

  it('renders when open is true', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.round-picker').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(RoundPicker, {
      props: {
        ...defaultProps,
        open: false,
      },
      ...mountOptions,
    })

    expect(wrapper.find('.round-picker').exists()).toBe(false)
  })

  it('displays title', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.round-picker__title').text()).toBe('Select Round')
  })

  it('renders all 7 rounds', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    const items = wrapper.findAll('.round-picker__item')
    expect(items).toHaveLength(7)
  })

  it('displays round type name for each round', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    const types = wrapper.findAll('.round-picker__item-type')
    expect(types[0]!.text()).toBe('2 Books')
    expect(types[1]!.text()).toBe('1 Book 1 Run')
    expect(types[6]!.text()).toBe('3 Runs and Out')
  })

  it('displays round number for each round', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
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
      ...mountOptions,
    })

    const items = wrapper.findAll('.round-picker__item')
    expect(items[2]!.classes()).toContain('round-picker__item--active')
    expect(items[0]!.classes()).not.toContain('round-picker__item--active')
  })

  it('emits select with index when round is clicked', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    const items = wrapper.findAll('.round-picker__item')
    await items[3]!.trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([3])
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('.round-picker').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when panel is clicked', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('.round-picker__panel').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close when Escape key is pressed', async () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('.round-picker').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('shows checkmark for complete rounds', () => {
    const players = createMockPlayers()
    const rounds = createMockRounds()

    // Complete round 0: both players have scores, one has 0
    const completeRound = rounds[0]!
      .setScore(players[0]!.id, RoundScore.entered(Score.create(0)))
      .setScore(players[1]!.id, RoundScore.entered(Score.create(25)))

    const roundsWithComplete = [completeRound, ...rounds.slice(1)]

    const wrapper = mount(RoundPicker, {
      props: {
        ...defaultProps,
        rounds: roundsWithComplete,
        players,
      },
      ...mountOptions,
    })

    const statusIcons = wrapper.findAll('.round-picker__item-status')
    expect(statusIcons).toHaveLength(1)
  })

  it('has proper accessibility attributes on dialog', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
    })

    const dialog = wrapper.find('.round-picker')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBeTruthy()
  })

  it('has proper accessibility attributes on list', () => {
    const wrapper = mount(RoundPicker, {
      props: defaultProps,
      ...mountOptions,
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
      ...mountOptions,
    })

    const items = wrapper.findAll('.round-picker__item')
    expect(items[1]!.attributes('aria-selected')).toBe('true')
    expect(items[0]!.attributes('aria-selected')).toBe('false')
  })
})
