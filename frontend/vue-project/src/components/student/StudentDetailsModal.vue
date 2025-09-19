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
          <v-avatar color="white" size="40" class="mr-3">
            <span class="text-primary font-weight-bold">
              {{ getInitials(student?.name || '') }}
            </span>
          </v-avatar>
          <div>
            <h3 class="text-white">Detalhes do Estudante</h3>
            <p class="text-white text-body-2 mb-0 opacity-90">
              Informações completas
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="handleClose"
        />
      </v-card-title>

      <v-card-text v-if="isLoading" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          class="mb-4"
        />
        <p class="text-body-1">Carregando informações...</p>
      </v-card-text>

      <v-card-text v-else-if="error" class="py-6">
        <v-alert
          type="error"
          variant="tonal"
          class="mb-0"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-text v-else-if="student" class="py-6">
        <v-container fluid class="pa-0">
          <div class="mb-6">
            <h4 class="text-h6 mb-4 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-account</v-icon>
              Informações Pessoais
            </h4>
            
            <v-row dense>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <label class="info-label">Nome Completo</label>
                  <p class="info-value">{{ student.name }}</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <label class="info-label">Email</label>
                  <p class="info-value">
                    <a :href="`mailto:${student.email}`" class="text-primary text-decoration-none">
                      {{ student.email }}
                    </a>
                  </p>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="mb-6" />

          <div class="mb-6">
            <h4 class="text-h6 mb-4 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-school</v-icon>
              Informações Acadêmicas
            </h4>
            
            <v-row dense>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <label class="info-label">Registro Acadêmico (RA)</label>
                  <p class="info-value font-weight-medium">{{ student.ra }}</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <label class="info-label">CPF</label>
                  <p class="info-value text-mono">{{ formatCpf(student.cpf) }}</p>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="mb-6" />

          <div class="mb-4">
            <h4 class="text-h6 mb-4 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-information</v-icon>
              Informações do Sistema
            </h4>
            
            <v-row dense>
              <v-col cols="12">
                <div class="info-item">
                  <label class="info-label">ID do Sistema</label>
                  <p class="info-value text-mono text-caption">{{ student.id }}</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <label class="info-label">Data de Cadastro</label>
                  <p class="info-value">{{ formatDate(student.createdAt) }}</p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <label class="info-label">Última Atualização</label>
                  <p class="info-value">{{ formatDate(student.updatedAt) }}</p>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-container>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="handleClose"
        >
          Fechar
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-pencil"
          @click="handleEdit"
        >
          Editar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { studentService } from '@/services'
import type { Student } from '@/types'

export default defineComponent({
  name: 'StudentDetailsModal',

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    studentId: {
      type: String as PropType<string | null>,
      default: null
    }
  },

  emits: ['update:modelValue', 'edit-student'],

  data() {
    return {
      student: null as Student | null,
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
    async modelValue(newValue: boolean) {
      if (newValue && this.studentId) {
        await this.fetchStudentDetails()
      } else if (!newValue) {
        this.clearData()
      }
    }
  },

  methods: {
    async fetchStudentDetails() {
      if (!this.studentId) return

      this.isLoading = true
      this.error = null

      try {
        this.student = await studentService.getStudent(this.studentId)
      } catch (error) {
        console.error('Error fetching student details:', error)
        this.error = error instanceof Error ? error.message : 'Erro ao carregar detalhes do estudante'
      } finally {
        this.isLoading = false
      }
    },

    clearData() {
      this.student = null
      this.error = null
      this.isLoading = false
    },

    handleClose() {
      this.isOpen = false
    },

    handleEdit() {
      if (this.student) {
        this.$emit('edit-student', this.student)
        this.handleClose()
      }
    },

    getInitials(name: string): string {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    },

    formatCpf(cpf: string): string {
      const cleanCpf = cpf.replace(/\D/g, '')
      
      if (cleanCpf.length === 11) {
        return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      }
      
      return cpf
    },

    formatDate(dateString: string): string {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    }
  }
})
</script>

<style scoped>
.info-item {
  margin-bottom: 16px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 4px;
  display: block;
}

.info-value {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  word-break: break-word;
}

.text-mono {
  font-family: 'Roboto Mono', monospace;
}

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