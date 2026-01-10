import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StandingsList from '../StandingsList.vue'
import { Game, RoundScore, Score } from '@/domain'

describe('StandingsList', () => {
  function createGame(playerNames: string[] = ['Alice', 'Bob', 'Charlie']) {
    return Game.create(playerNames)
  }

  function setScore(game: Game, playerIndex: number, roundIndex: number, score: number): Game {
    const player = game.players[playerIndex]!
    const round = game.rounds[roundIndex]!
    const updatedRound = round.setScore(player.id, RoundScore.entered(Score.create(score)))
    return game.updateRound(roundIndex, updatedRound)
  }

  function skipPlayer(game: Game, playerIndex: number, roundIndex: number): Game {
    const player = game.players[playerIndex]!
    const round = game.rounds[roundIndex]!
    const updatedRound = round.setScore(player.id, RoundScore.skipped())
    return game.updateRound(roundIndex, updatedRound)
  }

  it('renders a row for each player', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie'])

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const rows = wrapper.findAll('.standings-list__row')
    expect(rows).toHaveLength(3)
  })

  it('displays player names', () => {
    const game = createGame(['Alice', 'Bob'])

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const names = wrapper.findAll('.standings-list__player-name')
    expect(names[0]!.text()).toContain('Alice')
    expect(names[1]!.text()).toContain('Bob')
  })

  it('displays player ranks', () => {
    let game = createGame(['Alice', 'Bob'])
    // Alice: 50, Bob: 30 -> Bob ranks 1st
    game = setScore(game, 0, 0, 50)
    game = setScore(game, 1, 0, 30)

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const ranks = wrapper.findAll('.standings-list__rank')
    // Bob is first (30), Alice is second (50)
    expect(ranks[0]!.text()).toBe('1')
    expect(ranks[1]!.text()).toBe('2')
  })

  it('displays player totals', () => {
    let game = createGame(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 25)
    game = setScore(game, 0, 1, 30)
    game = setScore(game, 1, 0, 40)

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const totals = wrapper.findAll('.standings-list__total')
    // Alice total: 55, Bob total: 40
    // Sorted: Bob (40) first, Alice (55) second
    expect(totals[0]!.text()).toBe('40')
    expect(totals[1]!.text()).toBe('55')
  })

  it('sorts players by total score ascending', () => {
    let game = createGame(['Alice', 'Bob', 'Charlie'])
    // Alice: 50, Bob: 30, Charlie: 40
    game = setScore(game, 0, 0, 50)
    game = setScore(game, 1, 0, 30)
    game = setScore(game, 2, 0, 40)

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const names = wrapper.findAll('.standings-list__player-name')
    expect(names[0]!.text()).toContain('Bob') // 30
    expect(names[1]!.text()).toContain('Charlie') // 40
    expect(names[2]!.text()).toContain('Alice') // 50
  })

  it('assigns same rank to tied players', () => {
    let game = createGame(['Alice', 'Bob', 'Charlie'])
    // Alice: 30, Bob: 30, Charlie: 50
    game = setScore(game, 0, 0, 30)
    game = setScore(game, 1, 0, 30)
    game = setScore(game, 2, 0, 50)

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const ranks = wrapper.findAll('.standings-list__rank')
    expect(ranks[0]!.text()).toBe('1')
    expect(ranks[1]!.text()).toBe('1')
    expect(ranks[2]!.text()).toBe('3')
  })

  it('shows skipped badge for players with skipped rounds', () => {
    let game = createGame(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 25)
    game = skipPlayer(game, 1, 0)

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const badges = wrapper.findAll('.standings-list__skipped-badge')
    expect(badges).toHaveLength(1)
    expect(badges[0]!.text()).toContain('Skipped')
  })

  it('does not show skipped badge for players without skipped rounds', () => {
    let game = createGame(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 25)
    game = setScore(game, 1, 0, 30)

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const badges = wrapper.findAll('.standings-list__skipped-badge')
    expect(badges).toHaveLength(0)
  })

  it('renders as ordered list', () => {
    const game = createGame(['Alice', 'Bob'])

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    expect(wrapper.find('ol.standings-list').exists()).toBe(true)
  })

  it('handles game with no scores', () => {
    const game = createGame(['Alice', 'Bob'])

    const wrapper = mount(StandingsList, {
      props: { game },
    })

    const totals = wrapper.findAll('.standings-list__total')
    expect(totals[0]!.text()).toBe('0')
    expect(totals[1]!.text()).toBe('0')
  })

  describe('winner emphasis', () => {
    it('does not show winner styling when isEnded is false', () => {
      let game = createGame(['Alice', 'Bob'])
      game = setScore(game, 0, 0, 0)
      game = setScore(game, 1, 0, 50)

      const wrapper = mount(StandingsList, {
        props: { game, isEnded: false },
      })

      const winnerRows = wrapper.findAll('.standings-list__row--winner')
      expect(winnerRows).toHaveLength(0)
    })

    it('shows winner styling when isEnded is true', () => {
      let game = createGame(['Alice', 'Bob'])
      game = setScore(game, 0, 0, 0)
      game = setScore(game, 1, 0, 50)

      const wrapper = mount(StandingsList, {
        props: { game, isEnded: true },
      })

      const winnerRows = wrapper.findAll('.standings-list__row--winner')
      expect(winnerRows).toHaveLength(1)
    })

    it('shows trophy icon for winner when isEnded is true', () => {
      let game = createGame(['Alice', 'Bob'])
      game = setScore(game, 0, 0, 0)
      game = setScore(game, 1, 0, 50)

      const wrapper = mount(StandingsList, {
        props: { game, isEnded: true },
      })

      const trophyIcons = wrapper.findAll('.standings-list__trophy-icon')
      expect(trophyIcons).toHaveLength(1)
    })

    it('shows winner styling for all tied winners', () => {
      let game = createGame(['Alice', 'Bob', 'Charlie'])
      // Alice and Bob tie at 30, Charlie at 50
      game = setScore(game, 0, 0, 30)
      game = setScore(game, 1, 0, 30)
      game = setScore(game, 2, 0, 50)

      const wrapper = mount(StandingsList, {
        props: { game, isEnded: true },
      })

      const winnerRows = wrapper.findAll('.standings-list__row--winner')
      expect(winnerRows).toHaveLength(2)
    })
  })
})
