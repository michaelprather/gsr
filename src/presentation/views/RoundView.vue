<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IconChevronLeft, IconChevronRight } from '../components/icons'
import { UiButton } from '../components/ui'
import { AppBrand } from '../components/layout'
import { RoundType } from '@/domain/valueObjects'

const router = useRouter()
const rounds = RoundType.all()
const activeIndex = ref(0)
const activeRound = computed(() => rounds[activeIndex.value]!)

function goBack() {
  router.back()
}

function selectRound(index: number) {
  activeIndex.value = index
}

function goToPrevious() {
  activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : rounds.length - 1
}

function goToNext() {
  activeIndex.value = activeIndex.value < rounds.length - 1 ? activeIndex.value + 1 : 0
}
</script>

<template>
  <main class="round-view">
    <header class="round-view__header">
      <div class="round-view__title-bar">
        <AppBrand size="small" />
      </div>

      <div class="round-view__nav">
        <UiButton variant="ghost" size="icon" aria-label="Go back" @click="goBack">
          <IconChevronLeft />
        </UiButton>

        <div class="round-view__title-area">
          <h1 class="round-view__title">Rounds</h1>
        </div>

        <div class="round-view__spacer" />
      </div>
    </header>

    <section class="round-view__content">
      <div class="round-view__controls">
        <UiButton variant="ghost" size="icon" aria-label="Previous round" @click="goToPrevious">
          <IconChevronLeft />
        </UiButton>

        <div class="round-view__current">
          <span class="round-view__current-label">Current Round</span>
          <span class="round-view__current-name">{{ activeRound.displayName }}</span>
        </div>

        <UiButton variant="ghost" size="icon" aria-label="Next round" @click="goToNext">
          <IconChevronRight />
        </UiButton>
      </div>

      <ol class="round-view__list">
        <li
          v-for="(round, index) in rounds"
          :key="round.name"
          class="round-view__item"
          :class="{ 'round-view__item--active': index === activeIndex }"
          @click="selectRound(index)"
        >
          <span class="round-view__number">{{ index + 1 }}</span>
          <span class="round-view__name">{{ round.displayName }}</span>
        </li>
      </ol>
    </section>
  </main>
</template>

<style src="./RoundView.css"></style>
