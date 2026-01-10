import { createRouter, createWebHistory } from 'vue-router'

import SetupView from '../views/SetupView.vue'
import ScoreEntryView from '../views/ScoreEntryView.vue'
import SummaryView from '../views/SummaryView.vue'

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
      path: '/summary',
      name: 'summary',
      component: SummaryView,
    },
  ],
})

export default router
