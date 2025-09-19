<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    @click:outside="handleClose"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between bg-primary">
        <div class="d-flex align-center">
          <v-icon color="white" size="32" class="mr-3">
            mdi-account-plus
          </v-icon>
          <div>
            <h3 class="text-white">{{ isEditMode ? 'Editar Estudante' : 'Cadastrar Novo Estudante' }}</h3>
            <p class="text-white text-body-2 mb-0 opacity-90">
              {{ isEditMode ? 'Atualize as informações do estudante' : 'Preencha os dados do novo estudante' }}
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          :disabled="isLoading"
          @click="handleClose"
        />
      </v-card-title>

      <v-card-text class="py-6">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="clearError"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="clearSuccess"
        >
          {{ successMessage }}
        </v-alert>

        <StudentForm
          :student="student"
          :is-loading="isLoading"
          @submit="handleSubmit"
          @cancel="handleClose"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Student } from '@/types'
import type { StudentCreateInput, StudentUpdateInput } from '@/validation'
import { studentService } from '@/services'
import StudentForm from './StudentForm.vue'

export default defineComponent({
  name: 'StudentCreateDialog',

  components: {
    StudentForm
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    student: {
      type: Object as PropType<Student | null>,
      default: null
    }
  },

  emits: ['update:modelValue', 'student-created', 'student-updated'],

  data() {
    return {
      isLoading: false,
      error: null as string | null,
      successMessage: null as string | null
    }
  },

  computed: {
    isOpen: {
      get(): boolean {
        return this.modelValue
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value)
      }
    },

    isEditMode(): boolean {
      return this.student !== null
    }
  },

  watch: {
    modelValue(newValue: boolean) {
      if (newValue) {
        this.clearMessages()
      }
    }
  },

  methods: {
    clearMessages() {
      this.error = null
      this.successMessage = null
    },

    clearError() {
      this.error = null
    },

    clearSuccess() {
      this.successMessage = null
    },

    async handleSubmit(formData: StudentCreateInput | StudentUpdateInput) {
      this.isLoading = true
      this.clearMessages()

      try {
        if (this.isEditMode && this.student) {
          // Update existing student
          const updatedStudent = await studentService.updateStudent(
            this.student.id, 
            formData as StudentUpdateInput
          )
          this.successMessage = 'Estudante atualizado com sucesso!'
          this.$emit('student-updated', updatedStudent)
          
          // Close dialog after a short delay to show success message
          setTimeout(() => {
            this.handleClose()
          }, 1500)
        } else {
          // Create new student
          const newStudent = await studentService.createStudent(formData as StudentCreateInput)
          this.successMessage = 'Estudante cadastrado com sucesso!'
          this.$emit('student-created', newStudent)
          
          // Close dialog after a short delay to show success message
          setTimeout(() => {
            this.handleClose()
          }, 1500)
        }
      } catch (error) {
        console.error('Error saving student:', error)
        this.error = error instanceof Error ? error.message : 'Erro ao salvar estudante'
      } finally {
        this.isLoading = false
      }
    },

    handleClose() {
      if (!this.isLoading) {
        this.clearMessages()
        this.isOpen = false
      }
    }
  }
})
</script>

<style scoped>
.v-card-title {
  padding: 20px 24px;
}

.v-card-text {
  padding: 0 24px 24px;
}
</style>