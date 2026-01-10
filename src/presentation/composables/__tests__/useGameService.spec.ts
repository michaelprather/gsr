import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useGameService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns a singleton GameService instance', async () => {
    const { useGameService } = await import('../useGameService')

    const service1 = useGameService()
    const service2 = useGameService()

    expect(service1).toBe(service2)
  })

  it('creates GameService with IndexedDBGameRepository', async () => {
    const mockRepo = { load: vi.fn() }
    const mockService = { startGame: vi.fn() }

    class MockIndexedDBGameRepository {
      constructor() {
        return mockRepo
      }
    }

    class MockGameService {
      constructor(repo: unknown) {
        expect(repo).toBe(mockRepo)
        return mockService
      }
    }

    vi.doMock('@/infrastructure', () => ({
      IndexedDBGameRepository: MockIndexedDBGameRepository,
    }))

    vi.doMock('@/application', () => ({
      GameService: MockGameService,
    }))

    const { useGameService } = await import('../useGameService')
    const service = useGameService()

    expect(service).toBe(mockService)
  })

})
