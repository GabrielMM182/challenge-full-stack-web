<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h4">Lista de Estudantes</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="handleCreateStudent"
        >
          Cadastrar Aluno
        </v-btn>
      </v-col>
    </v-row>
    <v-card v-if="isLoading" class="pa-4">
      <v-row justify="center">
        <v-col cols="auto">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-2">
        <v-col cols="auto">
          <p class="text-body-1">Carregando estudantes...</p>
        </v-col>
      </v-row>
    </v-card>
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="clearError"
    >
      {{ error }}
    </v-alert>
    <v-card v-else-if="students.length === 0" class="pa-8 text-center">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-account-group-outline
      </v-icon>
      <h3 class="text-h6 mb-2">Nenhum estudante encontrado</h3>
      <p class="text-body-2 text-grey mb-4">
        Comece cadastrando o primeiro estudante do sistema.
      </p>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="handleCreateStudent"
      >
        Cadastrar Primeiro Aluno
      </v-btn>
    </v-card>
    <v-card v-else-if="!isMobile" class="elevation-2">
      <v-data-table
        :headers="tableHeaders"
        :items="students"
        :loading="isLoading"
        class="elevation-0"
        item-key="id"
        no-data-text="Nenhum estudante encontrado"
        loading-text="Carregando estudantes..."
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-white text-body-2">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
            </div>
          </div>
        </template>
        <template #item.cpf="{ item }">
          <span class="text-mono">{{ formatCpf(item.cpf) }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="handleEditStudent(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="handleDeleteStudent(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <div v-else class="mobile-cards">
      <v-card
        v-for="student in students"
        :key="student.id"
        class="mb-3 elevation-2"
      >
        <v-card-text>
          <v-row align="center">
            <v-col cols="auto">
              <v-avatar color="primary" size="40">
                <span class="text-white">
                  {{ getInitials(student.name) }}
                </span>
              </v-avatar>
            </v-col>
            <v-col>
              <div class="font-weight-medium text-body-1">{{ student.name }}</div>
              <div class="text-body-2 text-grey">{{ student.email }}</div>
            </v-col>
            <v-col cols="auto">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item @click="handleEditStudent(student)">
                    <template #prepend>
                      <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleDeleteStudent(student)">
                    <template #prepend>
                      <v-icon>mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Excluir</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
          
          <v-divider class="my-3" />
          
          <v-row dense>
            <v-col cols="6">
              <div class="text-caption text-grey">RA</div>
              <div class="text-body-2">{{ student.ra }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">CPF</div>
              <div class="text-body-2 text-mono">{{ formatCpf(student.cpf) }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useDisplay } from 'vuetify'
import { studentService } from '@/services'
import type { Student } from '@/types'

export default defineComponent({
  name: 'StudentList',
  
  setup() {
    const { mobile } = useDisplay()
    return { isMobile: mobile }
  },

  data() {
    return {
      students: [] as Student[],
      isLoading: false,
      error: null as string | null,
      tableHeaders: [
        {
          title: 'Nome',
          key: 'name',
          sortable: true,
          width: '30%'
        },
        {
          title: 'Email',
          key: 'email',
          sortable: true,
          width: '30%'
        },
        {
          title: 'RA',
          key: 'ra',
          sortable: true,
          width: '15%'
        },
        {
          title: 'CPF',
          key: 'cpf',
          sortable: true,
          width: '15%'
        },
        {
          title: 'Ações',
          key: 'actions',
          sortable: false,
          width: '10%',
          align: 'center'
        }
      ]
    }
  },

  async mounted() {
    await this.fetchStudents()
  },

  methods: {
    async fetchStudents() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await studentService.getStudents()
        this.students = response.data
      } catch (error) {
        console.error('Error fetching students:', error)
        this.error = error instanceof Error ? error.message : 'Erro ao carregar estudantes'
      } finally {
        this.isLoading = false
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

    clearError() {
      this.error = null
    },

    handleCreateStudent() {
      console.log('Create student clicked')
    },

    handleEditStudent(student: Student) {
      console.log('Edit student:', student.id)
    },

    handleDeleteStudent(student: Student) {
      console.log('Delete student:', student.id)
    }
  }
})
</script>

<style scoped>
.text-mono {
  font-family: 'Roboto Mono', monospace;
}

.mobile-cards {
  max-width: 100%;
}

.gap-2 {
  gap: 8px;
}
</style>