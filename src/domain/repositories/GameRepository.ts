import type { Game } from '../entities'

export interface GameRepository {
  save(game: Game): Promise<void>
  load(): Promise<Game | null>
  clear(): Promise<void>
}
