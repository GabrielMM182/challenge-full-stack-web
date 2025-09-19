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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Ensure auth is initialized
  if (!authStore.token) {
    authStore.initializeAuth()
  }
  
  // Get token directly to avoid computed property issues during navigation
  const hasToken = !!authStore.token
  
  // Handle guest-only routes (login, register) - redirect authenticated users
  if (to.meta.requiresGuest) {
    if (hasToken) {
      return next('/students')
    }
    return next()
  }
  
  // Allow access to routes that don't require authentication
  if (to.meta.allowUnauthenticated) {
    return next()
  }
  
  // For all other routes, require authentication
  if (!hasToken) {
    return next('/login')
  }
  
  next()
})

export default router