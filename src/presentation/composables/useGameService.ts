import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

export function useGameService(): GameService {
  return service
}
