<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center bg-error">
        <v-icon color="white" size="32" class="mr-3">
          mdi-delete-alert
        </v-icon>
        <div>
          <h3 class="text-white">Confirmar Exclusão</h3>
          <p class="text-white text-body-2 mb-0 opacity-90">
            Esta ação não pode ser desfeita
          </p>
        </div>
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

        <div v-if="student" class="text-center">
          <v-avatar color="error" size="64" class="mb-4">
            <span class="text-white text-h6">
              {{ getInitials(student.name) }}
            </span>
          </v-avatar>
          
          <h4 class="text-h6 mb-2">{{ student.name }}</h4>
          <p class="text-body-1 text-grey mb-4">
            Tem certeza que deseja excluir este estudante?
          </p>
          
          <v-card variant="outlined" class="pa-4 mb-4">
            <v-row dense>
              <v-col cols="6">
                <div class="text-caption text-grey">Email</div>
                <div class="text-body-2">{{ student.email }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">RA</div>
                <div class="text-body-2">{{ student.ra }}</div>
              </v-col>
            </v-row>
          </v-card>
          
          <p class="text-body-2 text-error">
            <v-icon class="mr-1">mdi-alert</v-icon>
            Todos os dados do estudante serão permanentemente removidos do sistema.
          </p>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          :loading="isLoading"
          @click="handleConfirm"
        >
          Confirmar Exclusão
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Student } from '@/types'
import { studentService } from '@/services'

export default defineComponent({
  name: 'StudentDeleteDialog',

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

  emits: ['update:modelValue', 'student-deleted'],

  data() {
    return {
      isLoading: false,
      error: null as string | null
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
    }
  },

  watch: {
    modelValue(newValue: boolean) {
      if (newValue) {
        this.clearError()
      }
    }
  },

  methods: {
    clearError() {
      this.error = null
    },

    getInitials(name: string): string {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    },

    async handleConfirm() {
      if (!this.student) return

      this.isLoading = true
      this.clearError()

      try {
        await studentService.deleteStudent(this.student.id)
        this.$emit('student-deleted', this.student)
        this.isOpen = false
      } catch (error) {
        console.error('Error deleting student:', error)
        this.error = error instanceof Error ? error.message : 'Erro ao excluir estudante'
      } finally {
        this.isLoading = false
      }
    },

    handleCancel() {
      if (!this.isLoading) {
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
  padding: 0 24px;
}

.v-card-actions {
  padding: 16px 24px 24px;
}
</style>