import { describe, it, expect } from 'vitest'
import { Round } from '../Round'
import { RoundType, RoundScore, Score, PlayerId } from '../../valueObjects'

describe('Round', () => {
  const roundType = RoundType.fromName('twoBooks')

  describe('create', () => {
    it('creates round with type and no scores', () => {
      const round = Round.create(roundType)
      expect(round.type.name).toBe('twoBooks')
      expect(round.isLocked).toBe(false)
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

    it('throws when round is locked', () => {
      const playerId = PlayerId.generate()
      const round = Round.create(roundType).lock()

      expect(() => round.setScore(playerId, RoundScore.entered(Score.create(25)))).toThrow(
        'Cannot modify scores on a locked round',
      )
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

  describe('lock/unlock', () => {
    it('locks round', () => {
      const round = Round.create(roundType)
      const locked = round.lock()
      expect(locked.isLocked).toBe(true)
    })

    it('unlocks round', () => {
      const round = Round.create(roundType).lock()
      const unlocked = round.unlock()
      expect(unlocked.isLocked).toBe(false)
    })

    it('does not mutate original', () => {
      const round = Round.create(roundType)
      round.lock()
      expect(round.isLocked).toBe(false)
    })
  })
})
