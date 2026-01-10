<script setup lang="ts">
import type { Game } from '@/domain'
import { calculateRankings } from '@/domain'
import { IconUserSlashOutline } from '../icons'

const { game } = defineProps<{
  game: Game
}>()

const rankings = calculateRankings(game)
</script>

<template>
  <ol class="standings-list">
    <li v-for="player in rankings" :key="player.playerId" class="standings-list__row">
      <span class="standings-list__rank">{{ player.rank }}</span>

      <div class="standings-list__player-info">
        <span class="standings-list__player-name">
          {{ player.playerName }}
          <span v-if="player.hasSkippedRounds" class="standings-list__skipped-badge">
            <IconUserSlashOutline class="standings-list__skipped-icon" />
            Skipped
          </span>
        </span>
      </div>

      <span class="standings-list__total">{{ player.total }}</span>
    </li>
  </ol>
</template>

<style src="./StandingsList.css"></style>
