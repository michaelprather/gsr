import { createRouter, createWebHistory } from 'vue-router'

import SetupView from '../views/SetupView.vue'
import ScoreEntryView from '../views/ScoreEntryView.vue'
import StandingsView from '../views/StandingsView.vue'
import ImportView from '../views/ImportView.vue'
import HelpView from '../views/HelpView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'setup' },
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView,
    },
    {
      path: '/game',
      name: 'game',
      component: ScoreEntryView,
    },
    {
      path: '/standings',
      name: 'standings',
      component: StandingsView,
    },
    {
      path: '/import',
      name: 'import',
      component: ImportView,
    },
    {
      path: '/help',
      name: 'help',
      component: HelpView,
    },
  ],
})

export default router
