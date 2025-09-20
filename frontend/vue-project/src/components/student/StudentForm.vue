<template>
  <v-form ref="form" @submit.prevent="handleSubmit">
    <v-container fluid class="pa-0">
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="formData.name"
            label="Nome Completo *"
            variant="outlined"
            density="comfortable"
            :error-messages="errors.name"
            :disabled="isLoading"
            prepend-inner-icon="mdi-account"
            @blur="validateField('name')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="formData.email"
            label="Email *"
            type="email"
            variant="outlined"
            density="comfortable"
            :error-messages="errors.email"
            :disabled="isLoading"
            prepend-inner-icon="mdi-email"
            @blur="validateField('email')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.ra"
            label="Registro Acadêmico (RA) *"
            variant="outlined"
            density="comfortable"
            :error-messages="errors.ra"
            :disabled="isLoading || isEditMode"
            :readonly="isEditMode"
            prepend-inner-icon="mdi-school"
            placeholder="Ex: RA123456"
            @blur="validateField('ra')"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.cpf"
            label="CPF *"
            variant="outlined"
            density="comfortable"
            :error-messages="errors.cpf"
            :disabled="isLoading || isEditMode"
            :readonly="isEditMode"
            prepend-inner-icon="mdi-card-account-details"
            placeholder="000.000.000-00"
            @input="formatCpfInput"
            @blur="validateField('cpf')"
          />
        </v-col>
      </v-row>

      <v-row v-if="isEditMode" class="mt-2">
        <v-col cols="12">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="text-body-2"
          >
            <v-icon class="mr-2">mdi-information</v-icon>
            Os campos RA e CPF não podem ser alterados após o cadastro.
          </v-alert>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" class="d-flex gap-3 justify-end">
          <v-btn
            variant="outlined"
            :disabled="isLoading"
            @click="handleCancel"
          >
            Cancelar
          </v-btn>
          <v-btn
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
          >
            {{ isEditMode ? 'Atualizar' : 'Cadastrar' }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Student } from '@/types'
import { studentCreateSchema, studentUpdateSchema } from '@/validation'
import type { StudentCreateInput, StudentUpdateInput } from '@/validation'

interface FormData {
  name: string
  email: string
  ra: string
  cpf: string
}

interface FormErrors {
  name?: string[]
  email?: string[]
  ra?: string[]
  cpf?: string[]
}

export default defineComponent({
  name: 'StudentForm',

  props: {
    student: {
      type: Object as PropType<Student | null>,
      default: null
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['submit', 'cancel'],

  data() {
    return {
      formData: {
        name: '',
        email: '',
        ra: '',
        cpf: ''
      } as FormData,
      errors: {} as FormErrors
    }
  },

  computed: {
    isEditMode(): boolean {
      return this.student !== null
    },

    isFormValid(): boolean {
      return Object.keys(this.errors).length === 0 && 
             this.formData.name.trim() !== '' &&
             this.formData.email.trim() !== '' &&
             (!this.isEditMode ? (this.formData.ra.trim() !== '' && this.formData.cpf.trim() !== '') : true)
    }
  },

  watch: {
    student: {
      immediate: true,
      handler(newStudent: Student | null) {
        if (newStudent) {
          this.formData = {
            name: newStudent.name,
            email: newStudent.email,
            ra: newStudent.ra,
            cpf: newStudent.cpf
          }
        } else {
          this.resetForm()
        }
        this.errors = {}
      }
    }
  },

  methods: {
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        ra: '',
        cpf: ''
      }
      this.errors = {}
    },

    formatCpfInput() {
      let value = this.formData.cpf.replace(/\D/g, '')
      
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        this.formData.cpf = value
      }
    },

    validateField(field: keyof FormData) {
      try {
        if (this.isEditMode && (field === 'ra' || field === 'cpf')) {
          // Skip validation for readonly fields in edit mode
          delete this.errors[field]
          return
        }

        const fieldValue = this.formData[field]
        
        if (this.isEditMode) {
          if (field === 'name') {
            studentUpdateSchema.pick({ name: true }).parse({ name: fieldValue })
          } else if (field === 'email') {
            studentUpdateSchema.pick({ email: true }).parse({ email: fieldValue })
          }
        } else {
          if (field === 'name') {
            studentCreateSchema.pick({ name: true }).parse({ name: fieldValue })
          } else if (field === 'email') {
            studentCreateSchema.pick({ email: true }).parse({ email: fieldValue })
          } else if (field === 'ra') {
            studentCreateSchema.pick({ ra: true }).parse({ ra: fieldValue })
          } else if (field === 'cpf') {
            studentCreateSchema.pick({ cpf: true }).parse({ cpf: fieldValue })
          }
        }
        
        delete this.errors[field]
      } catch (error: any) {
        if (error.errors && error.errors.length > 0) {
          this.errors[field] = [error.errors[0].message]
        }
      }
    },

    validateForm(): boolean {
      const schema = this.isEditMode ? studentUpdateSchema : studentCreateSchema
      this.errors = {}

      try {
        if (this.isEditMode) {
          const updateData: StudentUpdateInput = {
            name: this.formData.name,
            email: this.formData.email
          }
          schema.parse(updateData)
        } else {
          const createData: StudentCreateInput = {
            name: this.formData.name,
            email: this.formData.email,
            ra: this.formData.ra,
            cpf: this.formData.cpf
          }
          schema.parse(createData)
        }
        return true
      } catch (error: any) {
        if (error.errors) {
          error.errors.forEach((err: any) => {
            const field = err.path[0] as keyof FormData
            if (!this.errors[field]) {
              this.errors[field] = []
            }
            this.errors[field]!.push(err.message)
          })
        }
        return false
      }
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      if (this.isEditMode) {
        const updateData: StudentUpdateInput = {
          name: this.formData.name.trim(),
          email: this.formData.email.trim()
        }
        this.$emit('submit', updateData)
      } else {
        const createData: StudentCreateInput = {
          name: this.formData.name.trim(),
          email: this.formData.email.trim(),
          ra: this.formData.ra.trim(),
          cpf: this.formData.cpf.replace(/\D/g, '') // Remove formatting for API
        }
        this.$emit('submit', createData)
      }
    },

    handleCancel() {
      this.$emit('cancel')
    }
  }
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

:deep(.v-field--disabled) {
  opacity: 0.7;
}

:deep(.v-field--readonly .v-field__input) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}
</style>