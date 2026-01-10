import { describe, it, expect, beforeEach } from 'vitest'
import { IndexedDBGameRepository } from '../IndexedDBGameRepository'
import { Game, RoundScore, Score } from '@/domain'

describe('IndexedDBGameRepository', () => {
  let repository: IndexedDBGameRepository

  beforeEach(() => {
    repository = new IndexedDBGameRepository()
    return repository.clear()
  })

  it('returns null when no game exists', async () => {
    const game = await repository.load()
    expect(game).toBeNull()
  })

  it('saves and loads a game', async () => {
    const game = Game.create(['Alice', 'Bob', 'Charlie'])

    await repository.save(game)
    const loaded = await repository.load()

    expect(loaded).not.toBeNull()
    expect(loaded!.players).toHaveLength(3)
    expect(loaded!.players.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('persists game state across repository instances', async () => {
    const game = Game.create(['Alice', 'Bob'])
    await repository.save(game)

    const newRepository = new IndexedDBGameRepository()
    const loaded = await newRepository.load()

    expect(loaded).not.toBeNull()
    expect(loaded!.players).toHaveLength(2)
  })

  it('overwrites existing game on save', async () => {
    const game1 = Game.create(['Alice', 'Bob'])
    await repository.save(game1)

    const game2 = Game.create(['Charlie', 'Diana', 'Eve'])
    await repository.save(game2)

    const loaded = await repository.load()
    expect(loaded!.players).toHaveLength(3)
    expect(loaded!.players[0]?.name).toBe('Charlie')
  })

  it('clears the saved game', async () => {
    const game = Game.create(['Alice', 'Bob'])
    await repository.save(game)

    await repository.clear()

    const loaded = await repository.load()
    expect(loaded).toBeNull()
  })

  it('preserves scores and round state', async () => {
    const game = Game.create(['Alice', 'Bob'])
    const playerId = game.players[0]?.id
    expect(playerId).toBeDefined()

    const round = game.rounds[0]!.setScore(playerId!, RoundScore.entered(Score.create(50)))
    const updatedGame = game.updateRound(0, round)

    await repository.save(updatedGame)
    const loaded = await repository.load()

    const loadedRound = loaded!.rounds[0]
    expect(loadedRound).toBeDefined()

    const score = loadedRound!.getScore(loaded!.players[0]!.id)
    expect(score?.type).toBe('entered')
    expect(score?.type === 'entered' && score.value.value).toBe(50)
  })
})
