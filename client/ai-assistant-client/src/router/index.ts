import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AIAssistant from '../components/AIAssistant.vue'
import DevelopmentAgent from '../components/DevelopmentAgent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/ai-assistant',
      name: 'ai-assistant',
      component: AIAssistant,
    },
    {
      path: '/development-agent',
      name: 'development-agent',
      component: DevelopmentAgent,
    },
  ],
})

export default router
