<script setup lang="ts">
import { ref } from 'vue'
import type { Game, Player, Round } from '@/domain'
import { RoundScore } from '@/domain'

const { game } = defineProps<{
  game: Game
}>()

const expandedRoundIndex = ref<number | null>(null)

function getPlayerTotal(player: Player): number {
  let total = 0
  for (const round of game.rounds) {
    const score = round.getScore(player.id)
    if (score && RoundScore.isEntered(score)) {
      total += score.value.value
    }
  }
  return total
}

function getCellDisplay(round: Round, player: Player): string {
  const score = round.getScore(player.id)

  if (!score || RoundScore.isPending(score)) {
    return ''
  }

  if (RoundScore.isSkipped(score)) {
    return '—'
  }

  if (RoundScore.isEntered(score)) {
    return String(score.value.value)
  }

  return ''
}

function isWinner(round: Round, player: Player): boolean {
  const score = round.getScore(player.id)
  return score !== undefined && RoundScore.isEntered(score) && score.value.value === 0
}

function isSkipped(round: Round, player: Player): boolean {
  const score = round.getScore(player.id)
  return score !== undefined && RoundScore.isSkipped(score)
}

function toggleRoundExpanded(index: number) {
  if (expandedRoundIndex.value === index) {
    expandedRoundIndex.value = null
  } else {
    expandedRoundIndex.value = index
  }
}
</script>

<template>
  <div class="scorecard">
    <table class="scorecard__table">
      <thead>
        <tr>
          <th class="scorecard__player-header">Player</th>
          <th
            v-for="(round, index) in game.rounds"
            :key="index"
            class="scorecard__round-header"
            :class="{ 'scorecard__round-header--expanded': expandedRoundIndex === index }"
            @click="toggleRoundExpanded(index)"
          >
            <span class="scorecard__round-abbr">{{ round.type.abbreviation }}</span>
            <span v-if="expandedRoundIndex === index" class="scorecard__round-full">
              {{ round.type.displayName }}
            </span>
          </th>
          <th class="scorecard__total-header">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in game.players" :key="player.id.value">
          <td class="scorecard__player-cell">{{ player.name }}</td>
          <td
            v-for="(round, index) in game.rounds"
            :key="index"
            class="scorecard__score-cell"
            :class="{
              'scorecard__score-cell--winner': isWinner(round, player),
              'scorecard__score-cell--skipped': isSkipped(round, player),
            }"
          >
            {{ getCellDisplay(round, player) }}
          </td>
          <td class="scorecard__total-cell">{{ getPlayerTotal(player) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style src="./GameScorecard.css"></style>
