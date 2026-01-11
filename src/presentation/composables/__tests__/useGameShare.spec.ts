import { describe, it, expect } from 'vitest'
import { GameShareService } from '@/application'
import { useGameShare } from '../useGameShare'

describe('useGameShare', () => {
  it('returns a GameShareService instance', () => {
    const service = useGameShare()
    expect(service).toBeInstanceOf(GameShareService)
  })

  it('returns the same instance on multiple calls (singleton)', () => {
    const service1 = useGameShare()
    const service2 = useGameShare()
    expect(service1).toBe(service2)
  })

  it('exposes encode method', () => {
    const service = useGameShare()
    expect(typeof service.encode).toBe('function')
  })

  it('exposes decode method', () => {
    const service = useGameShare()
    expect(typeof service.decode).toBe('function')
  })

  it('exposes createShareUrl method', () => {
    const service = useGameShare()
    expect(typeof service.createShareUrl).toBe('function')
  })
})
