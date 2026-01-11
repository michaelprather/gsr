import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Game } from '@/domain'
import { GameMapper, type GameDTO } from '@/infrastructure'

export class ShareDecodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShareDecodeError'
  }
}

export class GameShareService {
  private readonly mapper = new GameMapper()

  encode(game: Game): string {
    const dto = this.mapper.toDTO(game)
    const json = JSON.stringify(dto)
    const compressed = compressToEncodedURIComponent(json)
    return compressed
  }

  decode(encoded: string): Game {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) {
      throw new ShareDecodeError('Failed to decompress share data')
    }

    let dto: GameDTO
    try {
      dto = JSON.parse(json) as GameDTO
    } catch {
      throw new ShareDecodeError('Invalid share data format')
    }

    if (!this.isValidGameDTO(dto)) {
      throw new ShareDecodeError('Invalid game data structure')
    }

    return this.mapper.toDomain(dto)
  }

  createShareUrl(game: Game, origin: string): string {
    const encoded = this.encode(game)
    return `${origin}/import?data=${encoded}`
  }

  private isValidGameDTO(dto: unknown): dto is GameDTO {
    if (typeof dto !== 'object' || dto === null) return false

    const obj = dto as Record<string, unknown>

    if (!Array.isArray(obj.players)) return false
    if (!Array.isArray(obj.rounds)) return false
    if (typeof obj.isEnded !== 'boolean') return false

    for (const player of obj.players) {
      if (typeof player !== 'object' || player === null) return false
      if (typeof (player as Record<string, unknown>).id !== 'string') return false
      if (typeof (player as Record<string, unknown>).name !== 'string') return false
    }

    return true
  }
}
