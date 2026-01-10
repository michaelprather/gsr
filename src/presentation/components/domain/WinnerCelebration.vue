<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { WinnerCelebrationProps } from './WinnerCelebration.types'
import { IconTrophy } from '../icons'

const { winners } = defineProps<WinnerCelebrationProps>()

const emit = defineEmits<{
  dismiss: []
}>()

const isVisible = ref(false)
const confettiParticles = ref<Array<{ id: number; style: Record<string, string> }>>([])

let dismissTimer: ReturnType<typeof setTimeout> | undefined

const isTie = computed(() => winners.length > 1)

const winnerLabel = computed(() => {
  if (isTie.value) {
    return 'Winners!'
  }
  return 'Winner!'
})

const winnerNames = computed(() => {
  return winners.map((w) => w.name).join(' & ')
})

const winnerScore = computed(() => {
  return winners[0]?.score ?? 0
})

function generateConfetti() {
  const particles: Array<{ id: number; style: Record<string, string> }> = []
  const colors = [
    'var(--violet-400)',
    'var(--violet-500)',
    'var(--green-500)',
    'var(--amber-500)',
    'var(--teal-500)',
  ]

  for (let i = 0; i < 50; i++) {
    const left = Math.random() * 100
    const delay = Math.random() * 0.5
    const duration = 2 + Math.random() * 2
    const size = 6 + Math.random() * 8
    const color = colors[Math.floor(Math.random() * colors.length)]
    const rotation = Math.random() * 360
    const drift = (Math.random() - 0.5) * 100

    particles.push({
      id: i,
      style: {
        '--confetti-left': `${left}%`,
        '--confetti-delay': `${delay}s`,
        '--confetti-duration': `${duration}s`,
        '--confetti-size': `${size}px`,
        '--confetti-color': color ?? 'var(--violet-500)',
        '--confetti-rotation': `${rotation}deg`,
        '--confetti-drift': `${drift}px`,
      },
    })
  }

  confettiParticles.value = particles
}

function dismiss() {
  isVisible.value = false
  if (dismissTimer) {
    clearTimeout(dismissTimer)
  }
  setTimeout(() => {
    emit('dismiss')
  }, 300)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
    dismiss()
  }
}

onMounted(() => {
  generateConfetti()
  requestAnimationFrame(() => {
    isVisible.value = true
  })

  dismissTimer = setTimeout(() => {
    dismiss()
  }, 4000)

  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
  }
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div
    class="winner-celebration"
    :class="{ 'winner-celebration--visible': isVisible }"
    role="dialog"
    aria-modal="true"
    aria-label="Winner celebration"
    @click="dismiss"
  >
    <div class="winner-celebration__confetti" aria-hidden="true">
      <span
        v-for="particle in confettiParticles"
        :key="particle.id"
        class="winner-celebration__particle"
        :style="particle.style"
      />
    </div>

    <div class="winner-celebration__content">
      <div class="winner-celebration__trophy">
        <IconTrophy class="winner-celebration__trophy-icon" />
      </div>

      <span class="winner-celebration__label">{{ winnerLabel }}</span>

      <h2 class="winner-celebration__names">{{ winnerNames }}</h2>

      <span class="winner-celebration__score">{{ winnerScore }} points</span>

      <span class="winner-celebration__hint">Tap anywhere to continue</span>
    </div>
  </div>
</template>

<style src="./WinnerCelebration.css"></style>
