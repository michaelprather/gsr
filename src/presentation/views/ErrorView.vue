<script setup lang="ts">
import { UiButton } from '../components/ui'
import { AppBrand } from '../components/layout'

function reload() {
  window.location.href = '/'
}
</script>

<template>
  <main class="error-view">
    <header class="error-view__header">
      <AppBrand />
    </header>

    <section class="error-view__content">
      <h1 class="error-view__code">500</h1>
      <p class="error-view__message">Something went wrong</p>
      <UiButton @click="reload">Reload</UiButton>
    </section>
  </main>
</template>

<style src="./ErrorView.css"></style>
