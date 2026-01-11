<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UiButton } from '../components/ui'
import { AppBrand } from '../components/layout'

const router = useRouter()

function goHome() {
  router.push({ name: 'setup' })
}
</script>

<template>
  <main class="not-found-view">
    <header class="not-found-view__header">
      <AppBrand />
    </header>

    <section class="not-found-view__content">
      <h1 class="not-found-view__code">404</h1>
      <p class="not-found-view__message">Page not found</p>
      <UiButton @click="goHome">Go Home</UiButton>
    </section>
  </main>
</template>

<style src="./NotFoundView.css"></style>
