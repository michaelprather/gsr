<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameService } from '../composables'
import { UiButton } from '../components/ui'
import { AppBrand } from '../components/layout'

const router = useRouter()
const service = useGameService()

onMounted(async () => {
  const existingGame = await service.loadGame()
  if (existingGame && !existingGame.isEnded) {
    router.replace({ name: 'game' })
  }
})

function goToSetup() {
  router.push({ name: 'setup' })
}

function goToRounds() {
  router.push({ name: 'rounds' })
}
</script>

<template>
  <main class="splash-view">
    <section class="splash-view__hero">
      <AppBrand size="large" />
      <div class="splash-view__text">
        <h1 class="splash-view__title">George Street Rummy</h1>
        <p class="splash-view__tagline">Keep score, not paper</p>
      </div>
    </section>

    <section class="splash-view__content">
      <div class="splash-view__actions">
        <UiButton block @click="goToSetup">New Game</UiButton>
        <UiButton block variant="secondary" @click="goToRounds">Round Reference</UiButton>
      </div>
    </section>

    <footer class="splash-view__footer">
      <RouterLink :to="{ name: 'help' }" class="splash-view__link">
        How to Play
      </RouterLink>
    </footer>
  </main>
</template>

<style src="./SplashView.css"></style>
