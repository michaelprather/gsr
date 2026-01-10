import { ref, readonly, onMounted, type DeepReadonly, type Ref } from 'vue'

export type Theme = 'default' | 'contrast'

export interface UseThemeReturn {
  current: DeepReadonly<Ref<Theme>>
}

const current = ref<Theme>('default')
let initialized = false

function applyTheme(theme: Theme): void {
  if (theme === 'contrast') {
    document.documentElement.setAttribute('data-theme', 'contrast')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches
}

function resolveTheme(): Theme {
  return prefersHighContrast() ? 'contrast' : 'default'
}

export function useTheme(): UseThemeReturn {
  onMounted(() => {
    if (!initialized) {
      const theme = resolveTheme()
      current.value = theme
      applyTheme(theme)
      initialized = true
    }
  })

  return {
    current: readonly(current),
  }
}
