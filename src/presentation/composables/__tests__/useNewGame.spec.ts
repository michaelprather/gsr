import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNewGame } from '../useNewGame'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockClearGame = vi.fn()
const mockToastError = vi.fn()

vi.mock('../useGameService', () => ({
  useGameService: () => ({
    clearGame: mockClearGame,
  }),
}))

vi.mock('../useToast', () => ({
  useToast: () => ({
    error: mockToastError,
  }),
}))

describe('useNewGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClearGame.mockResolvedValue(undefined)
  })

  it('starts with dialog closed', () => {
    const { showDialog } = useNewGame()

    expect(showDialog.value).toBe(false)
  })

  it('opens dialog via openDialog()', () => {
    const { showDialog, openDialog } = useNewGame()

    openDialog()

    expect(showDialog.value).toBe(true)
  })

  it('closes dialog via closeDialog()', () => {
    const { showDialog, openDialog, closeDialog } = useNewGame()

    openDialog()
    expect(showDialog.value).toBe(true)

    closeDialog()

    expect(showDialog.value).toBe(false)
  })

  it('clears game, closes dialog, and navigates on confirm()', async () => {
    const { showDialog, openDialog, confirm } = useNewGame()

    openDialog()
    await confirm()

    expect(mockClearGame).toHaveBeenCalled()
    expect(showDialog.value).toBe(false)
    expect(mockPush).toHaveBeenCalledWith({ name: 'setup' })
  })

  it('shows error toast when clearGame fails', async () => {
    mockClearGame.mockRejectedValueOnce(new Error('DB error'))
    const { confirm } = useNewGame()

    await confirm()

    expect(mockToastError).toHaveBeenCalledWith('Failed to start new game')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('returns readonly showDialog ref', () => {
    const { showDialog } = useNewGame()

    // Readonly refs in Vue don't throw, they warn and don't update
    // @ts-expect-error - testing readonly behavior
    showDialog.value = true

    // Value should remain unchanged
    expect(showDialog.value).toBe(false)
  })
})
