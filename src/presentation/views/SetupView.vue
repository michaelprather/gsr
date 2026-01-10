<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { useAction } from '../composables'
import { UiConfirmDialog } from '../components/ui'
import { IconPlus, IconTrash } from '../components/icons'

const router = useRouter()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const playerNames = ref<string[]>([])
const newPlayerName = ref('')
const showNewGameConfirm = ref(false)
const nameInputRef = ref<HTMLInputElement | null>(null)

const startGameAction = useAction(() => service.startGame(playerNames.value))

const canStartGame = computed(() => playerNames.value.length >= 2)

onMounted(async () => {
  const existingGame = await service.loadGame()
  if (existingGame && !existingGame.isEnded) {
    router.replace({ name: 'game' })
    return
  }
  nameInputRef.value?.focus()
})

function addPlayer() {
  const name = newPlayerName.value.trim()
  if (!name) return

  const isDuplicate = playerNames.value.some(
    (existing) => existing.toLowerCase() === name.toLowerCase(),
  )
  if (isDuplicate) return

  playerNames.value.push(name)
  newPlayerName.value = ''
  nameInputRef.value?.focus()
}

function removePlayer(index: number) {
  playerNames.value.splice(index, 1)
}

async function handleStartGame() {
  const success = await startGameAction.execute()
  if (success) {
    router.push({ name: 'game' })
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    addPlayer()
  }
}

async function confirmNewGame() {
  await service.clearGame()
  playerNames.value = []
  showNewGameConfirm.value = false
  nameInputRef.value?.focus()
}

function cancelNewGame() {
  showNewGameConfirm.value = false
}
</script>

<template>
  <main class="setup-view">
    <header class="setup-view__header">
      <h1 class="setup-view__title">George Street Rummy</h1>
    </header>

    <section class="setup-view__content">
      <div class="setup-view__input-group">
        <input
          ref="nameInputRef"
          v-model="newPlayerName"
          type="text"
          class="setup-view__input"
          placeholder="Enter player name"
          maxlength="20"
          @keydown="handleKeydown"
        />
        <button
          type="button"
          class="setup-view__add-button"
          :disabled="!newPlayerName.trim()"
          aria-label="Add player"
          @click="addPlayer"
        >
          <IconPlus />
        </button>
      </div>

      <ul v-if="playerNames.length > 0" class="setup-view__player-list">
        <li
          v-for="(name, index) in playerNames"
          :key="index"
          class="setup-view__player-item"
        >
          <span class="setup-view__player-name">{{ name }}</span>
          <button
            type="button"
            class="setup-view__remove-button"
            :aria-label="`Remove ${name}`"
            @click="removePlayer(index)"
          >
            <IconTrash />
          </button>
        </li>
      </ul>

      <p v-else class="setup-view__empty-state">
        Add at least 2 players to start
      </p>

      <div
        v-if="startGameAction.state.value.isInvalid"
        class="setup-view__error"
      >
        {{ startGameAction.state.value.feedback?.get('players')?.[0] }}
      </div>
    </section>

    <footer class="setup-view__footer">
      <button
        type="button"
        class="setup-view__start-button"
        :disabled="!canStartGame || startGameAction.state.value.isPending"
        @click="handleStartGame"
      >
        {{ startGameAction.state.value.isPending ? 'Starting...' : 'Start Game' }}
      </button>
    </footer>

    <UiConfirmDialog
      :open="showNewGameConfirm"
      title="Start New Game?"
      message="This will end your current game. All progress will be lost."
      confirm-label="Start New"
      cancel-label="Keep Playing"
      :destructive="true"
      @confirm="confirmNewGame"
      @cancel="cancelNewGame"
    />
  </main>
</template>

<style src="./SetupView.css"></style>
