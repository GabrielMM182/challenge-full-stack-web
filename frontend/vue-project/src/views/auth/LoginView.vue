<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              <v-alert
                v-if="errorMessage"
                type="error"
                class="mb-4"
                dismissible
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-text-field
                v-model="credentials.email"
                :rules="emailRules"
                label="Email"
                type="email"
                prepend-icon="mdi-email"
                required
                :disabled="isLoading"
                class="mb-2"
              />

              <v-text-field
                v-model="credentials.password"
                :rules="passwordRules"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                :disabled="isLoading"
                class="mb-4"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                large
                :loading="isLoading"
                :disabled="!valid || isLoading"
                class="mb-3"
              >
                Login
              </v-btn>

              <div class="text-center">
                <span class="text-body-2">Don't have an account? </span>
                <router-link to="/register" class="text-primary text-decoration-none">
                  Register here
                </router-link>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginCredentials } from '@/types/auth.types'

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const form = ref()
    const valid = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')    
    const credentials = ref<LoginCredentials>({
      email: '',
      password: ''
    })
    
    const emailRules = [
      (v: string) => !!v || 'Email is required',
      (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
    ]
    
    const passwordRules = [
      (v: string) => !!v || 'Password is required',
    ]
    
    const isLoading = computed(() => authStore.isLoading)
    
    const handleLogin = async () => {
      errorMessage.value = ''
      const { valid: isFormValid } = await form.value.validate()
      if (!isFormValid) {
        return
      }
      
      try {
        await authStore.login(credentials.value)
        await router.push('/students')
      } catch (error: any) {
        // Use error message from backend (processed by api service)
        errorMessage.value = error.message || 'Login failed. Please try again.'
      }
    }
    
    return {
      form,
      valid,
      showPassword,
      errorMessage,
      credentials,
      emailRules,
      passwordRules,
      isLoading,
      handleLogin
    }
  }
})
</script>