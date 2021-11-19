import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '/src/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { portraitConstrainRatio: 11.5 / 9, landscapeBreakpointRatio: 18 / 9, landscapeConstrainRatio: 23 / 9 }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { portraitConstrainRatio: 8 / 9, landscapeBreakpointRatio: 18 / 9, landscapeConstrainRatio: 26 / 9 }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
