<script setup lang="ts">
import { IconLogo } from '../icons'

export interface AppBrandProps {
  size?: 'small' | 'default'
}

const { size = 'default' } = defineProps<AppBrandProps>()
</script>

<template>
  <div class="app-brand" :class="{ 'app-brand--small': size === 'small' }">
    <IconLogo class="app-brand__logo" />
    <span class="app-brand__name">George Street Rummy</span>
  </div>
</template>

<style src="./AppBrand.css"></style>
