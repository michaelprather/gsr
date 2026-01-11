import { describe, it, expect } from 'vitest'
import { compressToEncodedURIComponent } from 'lz-string'
import { Game, Score, RoundScore } from '@/domain'
import { GameShareService, ShareDecodeError } from '../GameShareService'

describe('GameShareService', () => {
  const service = new GameShareService()

  function createTestGame(): Game {
    return Game.create(['Alice', 'Bob'])
  }

  describe('encode', () => {
    it('encodes a game to a URL-safe string', () => {
      const game = createTestGame()
      const encoded = service.encode(game)

      expect(encoded).toBeTypeOf('string')
      expect(encoded.length).toBeGreaterThan(0)
      // lz-string's compressToEncodedURIComponent is URL-safe
      // It uses a custom alphabet that avoids characters needing percent-encoding
    })

    it('produces compact output', () => {
      const game = createTestGame()
      const encoded = service.encode(game)

      // Compressed output should be smaller than raw JSON
      // A 2-player game JSON is ~1KB, compressed should be well under
      expect(encoded.length).toBeLessThan(500)
    })
  })

  describe('decode', () => {
    it('decodes an encoded game back to original state', () => {
      const originalGame = createTestGame()
      const encoded = service.encode(originalGame)
      const decodedGame = service.decode(encoded)

      expect(decodedGame.players.length).toBe(originalGame.players.length)
      expect(decodedGame.players[0]!.name).toBe('Alice')
      expect(decodedGame.players[1]!.name).toBe('Bob')
      expect(decodedGame.rounds.length).toBe(originalGame.rounds.length)
      expect(decodedGame.isEnded).toBe(originalGame.isEnded)
    })

    it('throws ShareDecodeError for invalid compressed data', () => {
      expect(() => service.decode('invalid-data')).toThrow(ShareDecodeError)
    })

    it('throws ShareDecodeError for malformed JSON', () => {
      const badData = compressToEncodedURIComponent('not valid json {')

      expect(() => service.decode(badData)).toThrow(ShareDecodeError)
      expect(() => service.decode(badData)).toThrow('Invalid share data format')
    })

    it('throws ShareDecodeError for invalid game structure', () => {
      const invalidGame = compressToEncodedURIComponent(
        JSON.stringify({ players: 'not an array', rounds: [], isEnded: false }),
      )

      expect(() => service.decode(invalidGame)).toThrow(ShareDecodeError)
      expect(() => service.decode(invalidGame)).toThrow('Invalid game data structure')
    })
  })

  describe('createShareUrl', () => {
    it('creates a URL with encoded game data', () => {
      const game = createTestGame()
      const url = service.createShareUrl(game, 'https://example.com')

      expect(url).toMatch(/^https:\/\/example\.com\/import\?data=/)
      expect(url).toContain('?data=')
    })

    it('creates a URL that can be decoded', () => {
      const game = createTestGame()
      const url = service.createShareUrl(game, 'https://example.com')

      // Extract the data param
      const dataMatch = url.match(/\?data=(.+)$/)
      expect(dataMatch).not.toBeNull()

      const encoded = dataMatch?.[1]
      expect(encoded).toBeDefined()
      const decodedGame = service.decode(encoded!)

      expect(decodedGame.players[0]!.name).toBe('Alice')
    })
  })

  describe('round-trip with game state', () => {
    it('preserves scores through encode/decode', () => {
      const game = Game.create(['Alice', 'Bob'])
      const firstRound = game.rounds[0]!
      const firstPlayer = game.players[0]!
      const roundWithScores = firstRound.setScore(
        firstPlayer.id,
        RoundScore.entered(Score.create(50)),
      )
      const gameWithScores = game.updateRound(0, roundWithScores)

      const encoded = service.encode(gameWithScores)
      const decoded = service.decode(encoded)

      const decodedScore = decoded.rounds[0]!.getScore(decoded.players[0]!.id)
      expect(decodedScore?.type).toBe('entered')
      if (decodedScore?.type === 'entered') {
        expect(decodedScore.value.value).toBe(50)
      }
    })

    it('preserves ended game state', () => {
      const game = Game.create(['Alice', 'Bob']).end()

      const encoded = service.encode(game)
      const decoded = service.decode(encoded)

      expect(decoded.isEnded).toBe(true)
    })
  })
})
