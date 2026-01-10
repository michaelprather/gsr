<script setup lang="ts">
import { IconLogo } from '../icons'

export interface AppBrandProps {
  size?: 'small' | 'default'
}

const { size = 'default' } = defineProps<AppBrandProps>()
</script>

<template>
  <IconLogo
    class="app-brand"
    :class="{ 'app-brand--small': size === 'small' }"
    role="img"
    aria-label="George Street Rummy"
    title="George Street Rummy"
  />
</template>

<style src="./AppBrand.css"></style>
