<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Game } from '@/domain'
import { calculateRankings } from '@/domain'
import { IconChevronRight, IconTrophy } from '../icons'

const { game, isEnded = false } = defineProps<{
  game: Game
  isEnded?: boolean
}>()

const rankings = calculateRankings(game)

function isWinner(rank: number): boolean {
  return isEnded && rank === 1
}
</script>

<template>
  <ol class="standings-list">
    <li
      v-for="player in rankings"
      :key="player.playerId"
      class="standings-list__row"
      :class="{ 'standings-list__row--winner': isWinner(player.rank) }"
    >
      <span class="standings-list__rank">
        <IconTrophy v-if="isWinner(player.rank)" class="standings-list__trophy-icon" />
        <template v-else>{{ player.rank }}</template>
      </span>

      <RouterLink
        :to="{ name: 'player', params: { id: player.playerId } }"
        class="standings-list__player-link"
      >
        <div class="standings-list__player-info">
          <span class="standings-list__player-name">{{ player.playerName }}</span>
        </div>

        <span class="standings-list__total">{{ player.total }}</span>

        <IconChevronRight class="standings-list__chevron" />
      </RouterLink>
    </li>
  </ol>
</template>

<style src="./StandingsList.css"></style>
