<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GameService } from '@/application'
import { IndexedDBGameRepository } from '@/infrastructure'
import { useAction, useTheme } from '../composables'
import { UiButton, UiConfirmDialog, UiInput } from '../components/ui'
import { IconPalette, IconPlus, IconTrash } from '../components/icons'

const router = useRouter()
const theme = useTheme()

const repo = new IndexedDBGameRepository()
const service = new GameService(repo)

const playerNames = ref<string[]>([])
const newPlayerName = ref('')
const showNewGameConfirm = ref(false)

const startGameAction = useAction(() => service.startGame(playerNames.value))

const playerNameInputRef = ref<InstanceType<typeof UiInput> | null>(null)

const canAddPlayer = computed(() => newPlayerName.value.trim().length > 0)
const canStartGame = computed(() => playerNames.value.length >= 2)

onMounted(async () => {
  const existingGame = await service.loadGame()
  if (existingGame && !existingGame.isEnded) {
    router.replace({ name: 'game' })
    return
  }
  playerNameInputRef.value?.focus()
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
  playerNameInputRef.value?.focus()
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
}

function cancelNewGame() {
  showNewGameConfirm.value = false
}
</script>

<template>
  <main class="setup-view">
    <header class="setup-view__header">
      <div class="setup-view__title-row">
        <h1 class="setup-view__title">George Street Rummy</h1>
        <UiButton
          variant="ghost"
          size="small"
          class="setup-view__theme-button"
          :title="`Theme: ${theme.current.value}`"
          aria-label="Change theme"
          @click="theme.cycle"
        >
          <IconPalette />
        </UiButton>
      </div>
    </header>

    <section class="setup-view__content">
      <div class="setup-view__input-group" @keydown="handleKeydown">
        <UiInput
          ref="playerNameInputRef"
          v-model="newPlayerName"
          label="Player name"
          :hide-label="true"
          placeholder="Enter player name"
          :maxlength="20"
        />
        <UiButton
          size="icon"
          :disabled="!canAddPlayer"
          aria-label="Add player"
          @click="addPlayer"
        >
          <IconPlus />
        </UiButton>
      </div>

      <TransitionGroup
        v-if="playerNames.length > 0"
        tag="ul"
        name="list"
        class="setup-view__player-list"
      >
        <li
          v-for="(name, index) in playerNames"
          :key="name"
          class="setup-view__player-item"
        >
          <span class="setup-view__player-name">{{ name }}</span>
          <UiButton
            variant="ghost"
            size="icon"
            :aria-label="`Remove ${name}`"
            @click="removePlayer(index)"
          >
            <IconTrash />
          </UiButton>
        </li>
      </TransitionGroup>

      <p v-else class="setup-view__empty-state">
        Add at least 2 players to start
      </p>

      <div
        v-if="startGameAction.state.value.isInvalid"
        class="setup-view__error"
        role="alert"
      >
        {{ startGameAction.state.value.feedback?.get('players')?.[0] }}
      </div>
    </section>

    <footer class="setup-view__footer">
      <UiButton
        block
        :disabled="!canStartGame"
        :loading="startGameAction.state.value.isPending"
        @click="handleStartGame"
      >
        {{ startGameAction.state.value.isPending ? 'Starting...' : 'Start Game' }}
      </UiButton>
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
