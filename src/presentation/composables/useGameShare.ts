import { GameShareService } from '@/application'

const service = new GameShareService()

export function useGameShare(): GameShareService {
  return service
}
