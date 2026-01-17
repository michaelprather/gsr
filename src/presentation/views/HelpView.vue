<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconChevronLeft } from '../components/icons'
import { UiButton } from '../components/ui'
import { AppBrand } from '../components/layout'
import { useSwipe } from '../composables/useSwipe'

const router = useRouter()
const carouselRef = ref<HTMLElement | null>(null)

const totalSlides = 6
const currentIndex = ref(0)

function goBack() {
  router.back()
}

function goToSection(index: number) {
  currentIndex.value = Math.max(0, Math.min(index, totalSlides - 1))
}

function goToPrevious() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function goToNext() {
  if (currentIndex.value < totalSlides - 1) {
    currentIndex.value++
  }
}

useSwipe(carouselRef, {
  onSwipeLeft: goToNext,
  onSwipeRight: goToPrevious,
})
</script>

<template>
  <main class="help-view">
    <header class="help-view__header">
      <div class="help-view__title-bar">
        <AppBrand size="small" />
      </div>

      <div class="help-view__nav">
        <UiButton variant="ghost" size="icon" aria-label="Go back" @click="goBack">
          <IconChevronLeft />
        </UiButton>

        <div class="help-view__title-area">
          <h1 class="help-view__title">Help</h1>
        </div>

        <div class="help-view__spacer" />
      </div>
    </header>

    <section ref="carouselRef" class="help-view__carousel">
      <div class="help-view__track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <!-- Slide 1: Objective & Basics -->
        <article class="help-view__slide">
          <div class="help-view__section">
            <h2 class="help-view__section-title">Objective</h2>
            <p class="help-view__text">
              Be the first player to "go out" by laying down all your cards in valid books and runs.
              The player who goes out scores 0 points for the round, while other players are
              penalized for the cards left in their hand.
            </p>

            <h3 class="help-view__subsection-title">Books</h3>
            <p class="help-view__text">
              A <strong>book</strong> is a set of 3 or more cards of the same rank (e.g., three 7s
              or four Kings).
            </p>

            <h3 class="help-view__subsection-title">Runs</h3>
            <p class="help-view__text">
              A <strong>run</strong> is a sequence of 3 or more consecutive cards in the same suit
              (e.g., 4-5-6 of hearts). Aces are always high.
            </p>

            <h3 class="help-view__subsection-title">Jokers</h3>
            <p class="help-view__text">
              Jokers are wild and can substitute for any card in a book or run.
            </p>
          </div>
        </article>

        <!-- Slide 2: Round Requirements -->
        <article class="help-view__slide">
          <div class="help-view__section">
            <h2 class="help-view__section-title">Round Requirements</h2>
            <p class="help-view__text">
              George Street Rummy is played over 7 rounds. Each player is dealt 11 cards. Each round
              has requirements that must be met before laying down cards:
            </p>
            <ul class="help-view__list">
              <li><strong>Round 1:</strong> 2 books</li>
              <li><strong>Round 2:</strong> 1 book and 1 run</li>
              <li><strong>Round 3:</strong> 2 runs</li>
              <li><strong>Round 4:</strong> 3 books</li>
              <li><strong>Round 5:</strong> 2 books and 1 run</li>
              <li><strong>Round 6:</strong> 1 book and 2 runs</li>
              <li><strong>Round 7:</strong> 3 runs (no discard to go out)</li>
            </ul>
          </div>
        </article>

        <!-- Slide 3: Gameplay -->
        <article class="help-view__slide">
          <div class="help-view__section">
            <h2 class="help-view__section-title">Gameplay</h2>

            <h3 class="help-view__subsection-title">Turn Structure</h3>
            <ul class="help-view__list">
              <li><strong>Draw:</strong> Take a card from the deck or discard pile</li>
              <li><strong>Play:</strong> Optionally lay down books/runs or add to existing melds</li>
              <li><strong>Discard:</strong> End your turn by discarding one card</li>
            </ul>

            <h3 class="help-view__subsection-title">Playing on Others' Cards</h3>
            <p class="help-view__text">
              Once you have laid down your required books and runs, you may play cards on melds that
              other players have laid down.
            </p>

            <h3 class="help-view__subsection-title">Joker Rules</h3>
            <p class="help-view__text">
              You may take a joker from any meld by replacing it with the card it represents. Any
              joker taken must be played before your turn ends.
            </p>
          </div>
        </article>

        <!-- Slide 4: Going Out -->
        <article class="help-view__slide">
          <div class="help-view__section">
            <h2 class="help-view__section-title">Going Out</h2>
            <p class="help-view__text">
              To go out, you must lay down all remaining cards in valid melds and discard your final
              card. You cannot go out if you have cards that cannot be melded.
            </p>

            <h3 class="help-view__subsection-title">Final Round</h3>
            <p class="help-view__text">
              In the final round, players cannot lay down any cards until they can play every card
              in their hand without discarding.
            </p>
          </div>
        </article>

        <!-- Slide 5: Scoring -->
        <article class="help-view__slide">
          <div class="help-view__section">
            <h2 class="help-view__section-title">Scoring</h2>

            <h3 class="help-view__subsection-title">Card Values</h3>
            <ul class="help-view__list">
              <li><strong>Number cards (2-10):</strong> Face value</li>
              <li><strong>Face cards (J, Q, K):</strong> 10 points</li>
              <li><strong>Aces:</strong> 15 points</li>
              <li><strong>Jokers:</strong> 25 points</li>
            </ul>

            <h3 class="help-view__subsection-title">Round Scoring</h3>
            <ul class="help-view__list">
              <li><strong>Winner:</strong> 0 points (went out)</li>
              <li><strong>Other players:</strong> Sum of card values left in hand</li>
            </ul>

            <h3 class="help-view__subsection-title">Winning the Game</h3>
            <p class="help-view__text">
              The player with the <strong>lowest total score</strong> after all 7 rounds wins.
            </p>
          </div>
        </article>

        <!-- Slide 6: Using the App -->
        <article class="help-view__slide">
          <div class="help-view__section">
            <h2 class="help-view__section-title">Using the App</h2>

            <h3 class="help-view__subsection-title">Starting a Game</h3>
            <p class="help-view__text">
              Enter player names on the setup screen and tap "Start Game" when you have at least 2
              players.
            </p>

            <h3 class="help-view__subsection-title">Recording Scores</h3>
            <p class="help-view__text">
              After each round, enter each player's score. Tap the crown icon to quickly set a
              player as the round winner (0 points).
            </p>

            <h3 class="help-view__subsection-title">Skipping Players</h3>
            <p class="help-view__text">
              If a player leaves mid-game, tap the skip icon next to their score.
            </p>

            <h3 class="help-view__subsection-title">Standings & Sharing</h3>
            <p class="help-view__text">
              Tap "Standings" to see rankings. Use the share icon to generate a QR code or link for
              others to import the game.
            </p>
          </div>
        </article>
      </div>

      <nav class="help-view__dots" aria-label="Carousel navigation">
        <button
          v-for="index in totalSlides"
          :key="index"
          class="help-view__dot"
          :class="{ 'help-view__dot--active': index - 1 === currentIndex }"
          :aria-label="`Go to slide ${index}`"
          :aria-current="index - 1 === currentIndex ? 'true' : undefined"
          @click="goToSection(index - 1)"
        />
      </nav>
    </section>
  </main>
</template>

<style src="./HelpView.css"></style>
