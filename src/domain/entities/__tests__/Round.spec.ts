import { describe, it, expect } from 'vitest'
import { Round } from '../Round'
import { RoundType, RoundScore, Score, PlayerId } from '../../valueObjects'

describe('Round', () => {
  const roundType = RoundType.fromName('twoBooks')

  describe('create', () => {
    it('creates round with type and no scores', () => {
      const round = Round.create(roundType)
      expect(round.type.name).toBe('twoBooks')
      expect(round.scores.size).toBe(0)
    })
  })

  describe('setScore', () => {
    it('sets score for player', () => {
      const playerId = PlayerId.generate()
      const round = Round.create(roundType)
      const score = RoundScore.entered(Score.create(25))

      const updated = round.setScore(playerId, score)

      expect(updated.getScore(playerId)?.type).toBe('entered')
    })

    it('returns new round without mutating original', () => {
      const playerId = PlayerId.generate()
      const round = Round.create(roundType)

      round.setScore(playerId, RoundScore.entered(Score.create(25)))

      expect(round.scores.size).toBe(0)
    })
  })

  describe('getScore', () => {
    it('returns undefined for player without score', () => {
      const playerId = PlayerId.generate()
      const round = Round.create(roundType)

      expect(round.getScore(playerId)).toBeUndefined()
    })

    it('returns score for player', () => {
      const playerId = PlayerId.generate()
      const score = RoundScore.entered(Score.create(50))
      const round = Round.create(roundType).setScore(playerId, score)

      const retrieved = round.getScore(playerId)
      expect(retrieved?.type).toBe('entered')
      expect(retrieved?.type === 'entered' && retrieved.value.value).toBe(50)
    })
  })
})
