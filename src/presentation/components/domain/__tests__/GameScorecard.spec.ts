import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameScorecard from '../GameScorecard.vue'
import { Game, RoundScore, Score } from '@/domain'

describe('GameScorecard', () => {
  function createGame(playerNames: string[] = ['Alice', 'Bob']) {
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

  it('renders a table', () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    expect(wrapper.find('table.scorecard__table').exists()).toBe(true)
  })

  it('renders a row for each player', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie'])

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('displays player names in first column', () => {
    const game = createGame(['Alice', 'Bob'])

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const playerCells = wrapper.findAll('.scorecard__player-cell')
    expect(playerCells[0]!.text()).toBe('Alice')
    expect(playerCells[1]!.text()).toBe('Bob')
  })

  it('renders column header for each round', () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const roundHeaders = wrapper.findAll('.scorecard__round-header')
    expect(roundHeaders).toHaveLength(7)
  })

  it('displays round abbreviations in headers', () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const abbreviations = wrapper.findAll('.scorecard__round-abbr')
    expect(abbreviations[0]!.text()).toBe('2B')
    expect(abbreviations[1]!.text()).toBe('1B1R')
    expect(abbreviations[6]!.text()).toBe('3R+')
  })

  it('expands header to show full name when clicked', async () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const headers = wrapper.findAll('.scorecard__round-header')
    await headers[0]!.trigger('click')

    expect(wrapper.find('.scorecard__round-full').exists()).toBe(true)
    expect(wrapper.find('.scorecard__round-full').text()).toBe('2 Books')
  })

  it('collapses header when clicked again', async () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const headers = wrapper.findAll('.scorecard__round-header')
    await headers[0]!.trigger('click')
    await headers[0]!.trigger('click')

    expect(wrapper.find('.scorecard__round-full').exists()).toBe(false)
  })

  it('only one header can be expanded at a time', async () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const headers = wrapper.findAll('.scorecard__round-header')
    await headers[0]!.trigger('click')
    await headers[1]!.trigger('click')

    const expandedHeaders = wrapper.findAll('.scorecard__round-header--expanded')
    expect(expandedHeaders).toHaveLength(1)
  })

  it('displays scores in cells', () => {
    let game = createGame(['Alice', 'Bob'])
    game = setScore(game, 0, 0, 25)
    game = setScore(game, 1, 0, 30)

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const scoreCells = wrapper.findAll('.scorecard__score-cell')
    expect(scoreCells[0]!.text()).toBe('25')
    expect(scoreCells[7]!.text()).toBe('30') // Second row, first round
  })

  it('displays dash for skipped rounds', () => {
    let game = createGame(['Alice'])
    game = skipPlayer(game, 0, 0)

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const scoreCells = wrapper.findAll('.scorecard__score-cell')
    expect(scoreCells[0]!.text()).toBe('—')
  })

  it('displays empty for pending scores', () => {
    const game = createGame(['Alice'])

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const scoreCells = wrapper.findAll('.scorecard__score-cell')
    expect(scoreCells[0]!.text()).toBe('')
  })

  it('applies winner class to cells with score 0', () => {
    let game = createGame(['Alice'])
    game = setScore(game, 0, 0, 0)

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const winnerCells = wrapper.findAll('.scorecard__score-cell--winner')
    expect(winnerCells).toHaveLength(1)
  })

  it('applies skipped class to skipped cells', () => {
    let game = createGame(['Alice'])
    game = skipPlayer(game, 0, 0)

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const skippedCells = wrapper.findAll('.scorecard__score-cell--skipped')
    expect(skippedCells).toHaveLength(1)
  })

  it('displays player totals', () => {
    let game = createGame(['Alice'])
    game = setScore(game, 0, 0, 25)
    game = setScore(game, 0, 1, 30)

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const totalCells = wrapper.findAll('.scorecard__total-cell')
    expect(totalCells[0]!.text()).toBe('55')
  })

  it('calculates total ignoring skipped rounds', () => {
    let game = createGame(['Alice'])
    game = setScore(game, 0, 0, 25)
    game = skipPlayer(game, 0, 1)
    game = setScore(game, 0, 2, 30)

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    const totalCells = wrapper.findAll('.scorecard__total-cell')
    expect(totalCells[0]!.text()).toBe('55')
  })

  it('has Player header column', () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    expect(wrapper.find('.scorecard__player-header').text()).toBe('Player')
  })

  it('has Total header column', () => {
    const game = createGame()

    const wrapper = mount(GameScorecard, {
      props: { game },
    })

    expect(wrapper.find('.scorecard__total-header').text()).toBe('Total')
  })
})
