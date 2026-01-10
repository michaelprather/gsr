import { ref, readonly, onMounted, type DeepReadonly, type Ref } from 'vue'

export type Theme = 'violet' | 'blue' | 'contrast'

export interface UseThemeReturn {
  current: DeepReadonly<Ref<Theme>>
  themes: readonly Theme[]
  set: (theme: Theme) => void
  cycle: () => void
}

const STORAGE_KEY = 'gsr-theme'
const DEFAULT_THEME: Theme = 'violet'
const THEMES: readonly Theme[] = ['violet', 'blue', 'contrast'] as const

const current = ref<Theme>(DEFAULT_THEME)
let initialized = false

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

function loadFromStorage(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEMES.includes(saved as Theme)) {
      return saved as Theme
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_THEME
}

function saveToStorage(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable
  }
}

export function useTheme(): UseThemeReturn {
  function set(theme: Theme): void {
    current.value = theme
    applyTheme(theme)
    saveToStorage(theme)
  }

  function cycle(): void {
    const currentIndex = THEMES.indexOf(current.value)
    const nextIndex = (currentIndex + 1) % THEMES.length
    const nextTheme = THEMES[nextIndex] ?? DEFAULT_THEME
    set(nextTheme)
  }

  onMounted(() => {
    if (!initialized) {
      const saved = loadFromStorage()
      current.value = saved
      applyTheme(saved)
      initialized = true
    }
  })

  return {
    current: readonly(current),
    themes: THEMES,
    set,
    cycle,
  }
}
