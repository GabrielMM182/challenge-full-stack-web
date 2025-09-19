<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

export default defineComponent({
  name: 'App',
  
  async mounted() {
    const authStore = useAuthStore()
    await authStore.initializeAuth()
  }
})
</script>

<style scoped>
/* App-specific styles */
</style>