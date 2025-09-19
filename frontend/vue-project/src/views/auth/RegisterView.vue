<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleRegister">
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
                v-model="registerData.name"
                :rules="nameRules"
                label="Full Name"
                type="text"
                prepend-icon="mdi-account"
                required
                :disabled="isLoading"
                class="mb-2"
              />

              <v-text-field
                v-model="registerData.email"
                :rules="emailRules"
                label="Email"
                type="email"
                prepend-icon="mdi-email"
                required
                :disabled="isLoading"
                class="mb-2"
              />

              <v-text-field
                v-model="registerData.password"
                :rules="passwordRules"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                :disabled="isLoading"
                class="mb-2"
              />

              <v-text-field
                v-model="registerData.confirmPassword"
                :rules="confirmPasswordRules"
                label="Confirm Password"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock-check"
                :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showConfirmPassword = !showConfirmPassword"
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
                Register
              </v-btn>

              <div class="text-center">
                <span class="text-body-2">Already have an account? </span>
                <router-link to="/login" class="text-primary text-decoration-none">
                  Login here
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
import type { RegisterData } from '@/types/auth.types'

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const form = ref()
    const valid = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const errorMessage = ref('')
    
    const registerData = ref<RegisterData>({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    
    const nameRules = [
      (v: string) => !!v || 'Name is required',
      (v: string) => v.length >= 2 || 'Name must be at least 2 characters'
    ]
    
    const emailRules = [
      (v: string) => !!v || 'Email is required',
      (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
    ]
    
    const passwordRules = [
      (v: string) => !!v || 'Password is required',
      (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
    ]
    
    const confirmPasswordRules = [
      (v: string) => !!v || 'Confirm password is required',
      (v: string) => v === registerData.value.password || 'Passwords do not match'
    ]
    
    const isLoading = computed(() => authStore.isLoading)
    
    const handleRegister = async () => {
      errorMessage.value = ''
      const { valid: isFormValid } = await form.value.validate()
      if (!isFormValid) {
        return
      }
      
      try {
        await authStore.register(registerData.value)
        await router.push('/students')
      } catch (error: any) {
        errorMessage.value = error.message || 'Registration failed. Please try again.'
      }
    }
    
    return {
      form,
      valid,
      showPassword,
      showConfirmPassword,
      errorMessage,
      registerData,
      nameRules,
      emailRules,
      passwordRules,
      confirmPasswordRules,
      isLoading,
      handleRegister
    }
  }
})
</script>