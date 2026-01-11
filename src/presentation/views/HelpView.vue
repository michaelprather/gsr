<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IconChevronLeft } from '../components/icons'
import { UiButton } from '../components/ui'
import { AppBrand } from '../components/layout'

const router = useRouter()

function goBack() {
  router.back()
}
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

    <section class="help-view__content">
      <nav class="help-view__toc" aria-label="Table of contents">
        <a href="#how-to-play" class="help-view__toc-link">How to Play</a>
        <a href="#scoring" class="help-view__toc-link">Scoring</a>
        <a href="#using-the-app" class="help-view__toc-link">Using the App</a>
      </nav>

      <article id="how-to-play" class="help-view__section">
        <h2 class="help-view__section-title">How to Play</h2>

        <h3 class="help-view__subsection-title">Objective</h3>
        <p class="help-view__text">
          Be the first player to "go out" by laying down all your cards in valid books and runs. The
          player who goes out scores 0 points for the round, while other players are penalized for
          the cards left in their hand.
        </p>

        <h3 class="help-view__subsection-title">Books and Runs</h3>
        <p class="help-view__text">
          A <strong>book</strong> is a set of 3 or more cards of the same rank (e.g., three 7s or
          four Kings).
        </p>
        <p class="help-view__text">
          A <strong>run</strong> is a sequence of 3 or more consecutive cards in the same suit
          (e.g., 4-5-6 of hearts). Aces are always high.
        </p>
        <p class="help-view__text">
          Jokers are wild and can substitute for any card in a book or run.
        </p>

        <h3 class="help-view__subsection-title">Round Structure</h3>
        <p class="help-view__text">
          George Street Rummy is played over 7 rounds. Each player is dealt 11 cards in every round.
          Each round has specific requirements that must be met before a player can lay down cards:
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

        <h3 class="help-view__subsection-title">Turn Structure</h3>
        <ul class="help-view__list">
          <li><strong>Draw:</strong> Take a card from the deck or discard pile</li>
          <li>
            <strong>Play:</strong> Optionally lay down books or runs, or add to existing melds
          </li>
          <li><strong>Discard:</strong> End your turn by discarding one card</li>
        </ul>

        <h3 class="help-view__subsection-title">Playing on Others' Cards</h3>
        <p class="help-view__text">
          Once you have laid down your required books and runs, you may play cards on melds that
          other players have laid down. You can add cards to extend their books or runs.
        </p>

        <h3 class="help-view__subsection-title">Joker Rules</h3>
        <p class="help-view__text">
          You may take a joker from any meld on the table (yours or another player's) by replacing
          it with the card it represents. Any joker taken this way must be played before your turn
          ends—it cannot be kept in your hand.
        </p>

        <h3 class="help-view__subsection-title">Going Out</h3>
        <p class="help-view__text">
          To go out, you must lay down all remaining cards in valid melds and discard your final
          card. You cannot go out if you have cards that cannot be melded.
        </p>

        <h3 class="help-view__subsection-title">Final Round</h3>
        <p class="help-view__text">
          In the final round, players cannot lay down any cards until they can play every card in
          their hand without discarding.
        </p>
      </article>

      <article id="scoring" class="help-view__section">
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
          <li><strong>Other players:</strong> Sum of values of cards left in hand</li>
        </ul>

        <h3 class="help-view__subsection-title">Winning the Game</h3>
        <p class="help-view__text">
          The player with the <strong>lowest total score</strong> after all 7 rounds wins the game.
        </p>
      </article>

      <article id="using-the-app" class="help-view__section">
        <h2 class="help-view__section-title">Using the App</h2>

        <h3 class="help-view__subsection-title">Starting a Game</h3>
        <p class="help-view__text">
          Enter player names on the setup screen and tap "Start Game" when you have at least 2
          players.
        </p>

        <h3 class="help-view__subsection-title">Recording Scores</h3>
        <p class="help-view__text">
          After each round, enter each player's score. The round winner should have 0 points. Tap
          the crown icon to quickly set a player as the winner.
        </p>

        <h3 class="help-view__subsection-title">Skipping Players</h3>
        <p class="help-view__text">
          If a player leaves mid-game, tap the skip icon next to their score. You can skip them for
          just the current round or all remaining rounds.
        </p>

        <h3 class="help-view__subsection-title">Viewing Standings</h3>
        <p class="help-view__text">
          Tap "Standings" to see current rankings. Rotate your device to landscape mode to view the
          full scorecard.
        </p>

        <h3 class="help-view__subsection-title">Sharing Games</h3>
        <p class="help-view__text">
          Tap the share icon to generate a QR code or link that lets others import the game on their
          device.
        </p>
      </article>
    </section>
  </main>
</template>

<style src="./HelpView.css"></style>
