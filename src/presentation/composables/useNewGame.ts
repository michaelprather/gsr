import { ref, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { useGameService } from './useGameService'

export function useNewGame() {
  const router = useRouter()
  const service = useGameService()

  const showDialog = ref(false)

  function openDialog() {
    showDialog.value = true
  }

  function closeDialog() {
    showDialog.value = false
  }

  async function confirm() {
    try {
      await service.clearGame()
      showDialog.value = false
      router.push({ name: 'setup' })
    } catch {
      // Error handling - could show toast
    }
  }

  return {
    showDialog: readonly(showDialog),
    openDialog,
    closeDialog,
    confirm,
  }
}
