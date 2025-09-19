import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    redirect: '/students'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('../views/student/StudentsView.vue'),
    meta: { allowUnauthenticated: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.token) {
    await authStore.initializeAuth()
  }
  
  const isAuthenticated = authStore.isAuthenticated
  
  if (to.meta.requiresGuest) {
    if (isAuthenticated) {
      return next('/students')
    }
    return next()
  }
  
  if (to.meta.allowUnauthenticated) {
    return next()
  }
  
  if (!isAuthenticated) {
    return next('/login')
  }
  
  next()
})

export default router