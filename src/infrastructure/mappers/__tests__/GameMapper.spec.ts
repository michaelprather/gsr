import { describe, it, expect } from 'vitest'
import { GameMapper } from '../GameMapper'
import { Game, RoundScore, Score } from '@/domain'

describe('GameMapper', () => {
  const mapper = new GameMapper()

  it('converts a game to DTO and back', () => {
    const game = Game.create(['Alice', 'Bob'])

    const dto = mapper.toDTO(game)
    const restored = mapper.toDomain(dto)

    expect(restored.players).toHaveLength(2)
    expect(restored.players[0]?.name).toBe('Alice')
    expect(restored.players[1]?.name).toBe('Bob')
    expect(restored.rounds).toHaveLength(7)
    expect(restored.isEnded).toBe(false)
  })

  it('preserves round scores', () => {
    const game = Game.create(['Alice', 'Bob'])
    const aliceId = game.players[0]?.id
    const bobId = game.players[1]?.id
    expect(aliceId).toBeDefined()
    expect(bobId).toBeDefined()

    const round = game.rounds[0]!
      .setScore(aliceId!, RoundScore.entered(Score.create(25)))
      .setScore(bobId!, RoundScore.skipped())

    const updatedGame = game.updateRound(0, round)

    const dto = mapper.toDTO(updatedGame)
    const restored = mapper.toDomain(dto)

    const restoredRound = restored.rounds[0]
    expect(restoredRound).toBeDefined()

    const aliceScore = restoredRound!.getScore(restored.players[0]!.id)
    const bobScore = restoredRound!.getScore(restored.players[1]!.id)

    expect(aliceScore?.type).toBe('entered')
    expect(aliceScore?.type === 'entered' && aliceScore.value.value).toBe(25)
    expect(bobScore?.type).toBe('skipped')
  })

  it('preserves ended game state', () => {
    const game = Game.create(['Alice', 'Bob']).end()

    const dto = mapper.toDTO(game)
    const restored = mapper.toDomain(dto)

    expect(restored.isEnded).toBe(true)
  })

  it('preserves round types in order', () => {
    const game = Game.create(['Alice', 'Bob'])

    const dto = mapper.toDTO(game)
    const restored = mapper.toDomain(dto)

    expect(restored.rounds[0]?.type.displayName).toBe('2 Books')
    expect(restored.rounds[6]?.type.displayName).toBe('3 Runs and Out')
  })
})
