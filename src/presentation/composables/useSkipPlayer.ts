import { ref, readonly, type Ref, type DeepReadonly } from 'vue'
import type { Game, Player } from '@/domain'
import type { GameService } from '@/application'
import type { UseToastReturn } from './useToast'

export interface UseSkipPlayerOptions {
  game: Ref<Game | null>
  currentRoundIndex: Ref<number>
  service: GameService
  toast: UseToastReturn
}

export interface UseSkipPlayerReturn {
  showDialog: DeepReadonly<Ref<boolean>>
  targetPlayer: DeepReadonly<Ref<Player | null>>
  openDialog: (player: Player) => void
  closeDialog: () => void
  skipRound: () => Promise<void>
  skipAll: () => Promise<void>
  unskip: (player: Player) => Promise<void>
}

export function useSkipPlayer(options: UseSkipPlayerOptions): UseSkipPlayerReturn {
  const { game, currentRoundIndex, service, toast } = options

  const showDialog = ref(false)
  const targetPlayer = ref<Player | null>(null)

  function openDialog(player: Player): void {
    targetPlayer.value = player
    showDialog.value = true
  }

  function closeDialog(): void {
    showDialog.value = false
    targetPlayer.value = null
  }

  async function skipRound(): Promise<void> {
    if (!targetPlayer.value) return

    try {
      const updatedGame = await service.skipPlayer(
        targetPlayer.value.id.value,
        currentRoundIndex.value,
        false,
      )
      game.value = updatedGame
      closeDialog()
    } catch {
      toast.error('Failed to skip player')
    }
  }

  async function skipAll(): Promise<void> {
    if (!targetPlayer.value) return

    try {
      const updatedGame = await service.skipPlayer(
        targetPlayer.value.id.value,
        currentRoundIndex.value,
        true,
      )
      game.value = updatedGame
      closeDialog()
    } catch {
      toast.error('Failed to skip player')
    }
  }

  async function unskip(player: Player): Promise<void> {
    try {
      const updatedGame = await service.unskipPlayer(player.id.value, currentRoundIndex.value)
      game.value = updatedGame
    } catch {
      toast.error('Failed to unskip player')
    }
  }

  return {
    showDialog: readonly(showDialog),
    targetPlayer: readonly(targetPlayer),
    openDialog,
    closeDialog,
    skipRound,
    skipAll,
    unskip,
  }
}
