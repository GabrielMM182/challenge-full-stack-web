<template>
  <div class="student-list-container">
    <v-card class="header-card mb-6" elevation="0" color="transparent">
      <v-card-text class="pa-6">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="8">
            <div class="header-content">
              <h1 class="page-title text-h4 font-weight-bold mb-2">
                <v-icon class="mr-3" size="32" color="primary">mdi-account-group</v-icon>
                Lista de Estudantes
              </h1>
              <p class="page-subtitle text-body-1 text-medium-emphasis mb-0">
                Gerencie os estudantes cadastrados no sistema
              </p>
              <v-alert v-if="!authStore.isAuthenticated" type="info" variant="tonal" density="compact" class="mt-3"
                icon="mdi-information-outline">
                Para cadastrar, editar ou excluir estudantes, é necessário fazer login
              </v-alert>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <div class="action-buttons">
              <template v-if="authStore.isAuthenticated">
                <v-btn color="primary" size="large" prepend-icon="mdi-plus" class="mr-2 mb-2"
                  @click="handleCreateStudent">
                  Novo Estudante
                </v-btn>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon="mdi-account-circle" size="large" variant="text" v-bind="props" />
                  </template>
                  <v-list>
                    <v-list-item @click="handleLogout">
                      <template #prepend>
                        <v-icon color="error">mdi-logout</v-icon>
                      </template>
                      <v-list-item-title>Sair</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <v-btn v-else color="primary" size="large" prepend-icon="mdi-login" @click="handleLogin">
                Fazer Login
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="search-card mb-4" elevation="1">
      <v-card-text class="pa-4">
        <v-row align="end" no-gutters>
          <v-col cols="12" md="8" class="pr-md-4">
            <v-text-field v-model="searchQuery" label="Buscar estudantes por nome ou email"
              prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" clearable hide-details
              @input="handleSearch" @click:clear="clearSearch" />
          </v-col>
          <v-col cols="12" md="4" class="mt-3 mt-md-0">
            <v-select v-model="pagination.limit" :items="itemsPerPageOptions" label="Itens por página"
              variant="outlined" density="comfortable" hide-details @update:model-value="handleItemsPerPageChange" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-if="isLoading" class="loading-card pa-8" elevation="1">
      <v-row justify="center" align="center">
        <v-col cols="auto" class="text-center">
          <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-4" />
          <p class="text-h6 font-weight-medium text-medium-emphasis">
            Carregando estudantes...
          </p>
        </v-col>
      </v-row>
    </v-card>
    <v-card v-else-if="error" class="error-card mb-4" elevation="1">
      <v-alert type="error" variant="tonal" prominent closable @click:close="clearError">
        <template #title>
          <span class="font-weight-bold">Erro ao carregar dados</span>
        </template>
        {{ error }}
      </v-alert>
    </v-card>
    <v-card v-else-if="students.length === 0" class="empty-state-card pa-12 text-center" elevation="1">
      <div class="empty-state-content">
        <v-avatar size="120" color="grey-lighten-4" class="mb-6">
          <v-icon size="60" color="grey-lighten-1">
            mdi-account-group-outline
          </v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-3">
          {{ searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum estudante cadastrado' }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-6 max-width-400">
          {{ searchQuery
            ? `Não encontramos estudantes com "${searchQuery}". Tente ajustar sua busca.`
            : authStore.isAuthenticated
              ? 'Comece cadastrando o primeiro estudante do sistema.'
              : 'Faça login para visualizar e gerenciar estudantes.'
          }}
        </p>
        <div class="empty-state-actions">
          <v-btn v-if="authStore.isAuthenticated && !searchQuery" color="primary" size="large" prepend-icon="mdi-plus"
            @click="handleCreateStudent">
            Cadastrar Primeiro Estudante
          </v-btn>
          <v-btn v-else-if="!authStore.isAuthenticated" color="primary" size="large" prepend-icon="mdi-login"
            @click="handleLogin">
            Fazer Login
          </v-btn>
          <v-btn v-if="searchQuery" variant="outlined" prepend-icon="mdi-refresh" @click="clearSearch">
            Limpar Busca
          </v-btn>
        </div>
      </div>
    </v-card>
    <v-card v-else-if="!isMobile" class="data-table-card" elevation="1">
      <v-card-title class="pa-4 bg-grey-lighten-5">
        <v-row align="center" justify="space-between">
          <v-col>
            <span class="text-h6 font-weight-bold">
              {{ pagination.total }} {{ pagination.total === 1 ? 'Estudante' : 'Estudantes' }}
            </span>
          </v-col>
          <v-col cols="auto">
            <v-chip v-if="searchQuery" closable color="primary" variant="outlined" @click:close="clearSearch">
              <v-icon start>mdi-magnify</v-icon>
              "{{ searchQuery }}"
            </v-chip>
          </v-col>
        </v-row>
      </v-card-title>
      <v-data-table :headers="tableHeaders" :items="students" :loading="isLoading" :sort-by="sortBy"
        class="elevation-0 modern-table" item-key="id" :show-select="false" no-data-text="Nenhum estudante encontrado"
        loading-text="Carregando estudantes..." hide-default-footer @update:sort-by="handleSortChange">
        <template #item.name="{ item }">
          <div class="student-name-cell d-flex align-center cursor-pointer hover-row pa-2"
            @click="handleViewStudent(item)">
            <v-avatar color="primary" size="40" class="mr-4 elevation-2">
              <span class="text-white font-weight-bold">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-h6 text-primary mb-1">
                {{ item.name }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Clique para ver detalhes
              </div>
            </div>
          </div>
        </template>
        <template #item.email="{ item }">
          <div class="email-cell">
            <div class="font-weight-medium">{{ item.email }}</div>
          </div>
        </template>
        <template #item.ra="{ item }">
          <v-chip color="primary" variant="outlined" size="small">
            {{ item.ra }}
          </v-chip>
        </template>
        <template #item.cpf="{ item }">
          <span class="text-mono font-weight-medium">{{ maskCpfForSecurity(item.cpf) }}</span>
        </template>
        <template v-if="authStore.isAuthenticated" #item.actions="{ item }">
          <div class="action-buttons-cell d-flex justify-center gap-1">
            <v-tooltip text="Editar estudante">
              <template #activator="{ props }">
                <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" v-bind="props"
                  @click="handleEditStudent(item)" />
              </template>
            </v-tooltip>
            <v-tooltip text="Excluir estudante">
              <template #activator="{ props }">
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" v-bind="props"
                  @click="handleDeleteStudent(item)" />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <div v-else class="mobile-cards">
      <div class="mobile-header mb-4">
        <v-row align="center" justify="space-between">
          <v-col>
            <span class="text-h6 font-weight-bold">
              {{ pagination.total }} {{ pagination.total === 1 ? 'Estudante' : 'Estudantes' }}
            </span>
          </v-col>
          <v-col cols="auto">
            <v-chip v-if="searchQuery" closable color="primary" variant="outlined" size="small"
              @click:close="clearSearch">
              <v-icon start size="small">mdi-magnify</v-icon>
              "{{ searchQuery }}"
            </v-chip>
          </v-col>
        </v-row>
      </div>

      <v-card v-for="student in students" :key="student.id"
        class="student-mobile-card mb-4 elevation-2 cursor-pointer hover-card" @click="handleViewStudent(student)">
        <v-card-text class="pa-4">
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-avatar color="primary" size="48" class="elevation-2">
                <span class="text-white font-weight-bold">
                  {{ getInitials(student.name) }}
                </span>
              </v-avatar>
            </v-col>
            <v-col class="pl-4">
              <div class="font-weight-bold text-h6 text-primary mb-1">
                {{ student.name }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ student.email }}
              </div>
            </v-col>
            <v-col v-if="authStore.isAuthenticated" cols="auto">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props" @click.stop />
                </template>
                <v-list>
                  <v-list-item @click="handleEditStudent(student)">
                    <template #prepend>
                      <v-icon color="primary">mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleDeleteStudent(student)">
                    <template #prepend>
                      <v-icon color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Excluir</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row dense>
            <v-col cols="6">
              <div class="info-label text-caption font-weight-bold text-medium-emphasis">RA</div>
              <v-chip color="primary" variant="outlined" size="small" class="mt-1">
                {{ student.ra }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="info-label text-caption font-weight-bold text-medium-emphasis">CPF</div>
              <div class="text-body-2 text-mono font-weight-medium mt-1">
                {{ maskCpfForSecurity(student.cpf) }}
              </div>
            </v-col>
          </v-row>

          <div class="mt-3 text-center">
            <v-chip color="primary" variant="text" size="small" prepend-icon="mdi-eye">
              Toque para ver detalhes
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-card v-if="students.length > 0" class="pagination-card mt-6" elevation="0" color="transparent">
      <v-card-text class="pa-4">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="auto" class="text-center text-md-left">
            <p class="text-body-2 text-medium-emphasis mb-0">
              Mostrando {{ getStartItem() }} - {{ getEndItem() }} de {{ pagination.total }} estudantes
            </p>
          </v-col>
          <v-col v-if="pagination.totalPages > 1" cols="12" md="auto" class="text-center">
            <v-pagination v-model="pagination.page" :length="pagination.totalPages" :total-visible="isMobile ? 5 : 7"
              color="primary" @update:model-value="handlePageChange" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <StudentDetailsModal v-model="showDetailsModal" :student-id="selectedStudentId" @edit-student="handleEditStudent" />

    <StudentCreateDialog v-model="showCreateDialog" :student="studentToEdit" @student-created="handleStudentCreated"
      @student-updated="handleStudentUpdated" />

    <StudentDeleteDialog v-model="showDeleteDialog" :student="studentToDelete"
      @student-deleted="handleStudentDeleted" />
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { studentService } from '@/services'
import type { Student, StudentQueryParams } from '@/types'
import StudentDetailsModal from './StudentDetailsModal.vue'
import StudentCreateDialog from './StudentCreateDialog.vue'
import StudentDeleteDialog from './StudentDeleteDialog.vue'
import { useAuthStore } from '@/stores/auth.store'
import { maskCpfForSecurity } from '@/utils/cpf.utils'

export default defineComponent({
  name: 'StudentList',

  components: {
    StudentDetailsModal,
    StudentCreateDialog,
    StudentDeleteDialog
  },

  setup() {
    const { mobile } = useDisplay()
    const authStore = useAuthStore()
    const router = useRouter()
    return {
      isMobile: mobile,
      authStore,
      router
    }
  },

  data() {
    return {
      students: [] as Student[],
      isLoading: false,
      error: null as string | null,
      showDetailsModal: false,
      selectedStudentId: null as string | null,
      showCreateDialog: false,
      showDeleteDialog: false,
      studentToEdit: null as Student | null,
      studentToDelete: null as Student | null,
      searchQuery: '',
      searchTimeout: null as NodeJS.Timeout | null,
      sortBy: [{ key: 'name', order: 'asc' }] as any,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      itemsPerPageOptions: [
        { title: '5 por página', value: 5 },
        { title: '10 por página', value: 10 },
      ],

      baseTableHeaders: [
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
        }
      ],
      actionsHeader: {
        title: 'Ações',
        key: 'actions',
        sortable: false,
        width: '10%',
        align: 'center'
      }
    }
  },

  computed: {
    tableHeaders(): any[] {
      const headers = [...this.baseTableHeaders]
      if (this.authStore.isAuthenticated) {
        headers.push(this.actionsHeader)
      }
      return headers
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
        const params: StudentQueryParams = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        if (this.searchQuery && this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }

        if (this.sortBy && this.sortBy.length > 0) {
          params.sortBy = this.sortBy[0].key
          params.sortOrder = this.sortBy[0].order
        }

        const response = await studentService.getStudents(params)
        this.students = response.data
        this.pagination = response.pagination
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

    maskCpfForSecurity,

    clearError() {
      this.error = null
    },

    handleLogin() {
      this.router.push('/login')
    },

    handleLogout() {
      this.authStore.logout()
      this.router.push('/login')
    },

    handleCreateStudent() {
      this.studentToEdit = null
      this.showCreateDialog = true
    },

    handleEditStudent(student: Student) {
      this.studentToEdit = student
      this.showCreateDialog = true
    },

    handleDeleteStudent(student: Student) {
      this.studentToDelete = student
      this.showDeleteDialog = true
    },

    async handleStudentCreated(student: Student) {
      console.log('Student created:', student)
      await this.fetchStudents()
    },

    async handleStudentUpdated(student: Student) {
      console.log('Student updated:', student)
      await this.fetchStudents()
    },

    async handleStudentDeleted(student: Student) {
      console.log('Student deleted:', student)
      await this.fetchStudents()
    },

    handleViewStudent(student: Student) {
      this.selectedStudentId = student.id
      this.showDetailsModal = true
    },

    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.fetchStudents()
      }, 500)
    },

    clearSearch() {
      this.searchQuery = ''
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.pagination.page = 1
      this.fetchStudents()
    },

    handleSortChange(sortBy: any) {
      this.sortBy = sortBy
      this.pagination.page = 1
      this.fetchStudents()
    },

    handlePageChange(page: number) {
      this.pagination.page = page
      this.fetchStudents()
    },

    getStartItem(): number {
      return (this.pagination.page - 1) * this.pagination.limit + 1
    },

    getEndItem(): number {
      const end = this.pagination.page * this.pagination.limit
      return Math.min(end, this.pagination.total)
    },

    handleItemsPerPageChange() {
      this.pagination.page = 1
      this.fetchStudents()
    }
  }
})
</script>

<style scoped>
.page-title {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: rgb(var(--v-theme-on-surface));
}

.page-subtitle {
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  line-height: 1.5;
}

.text-mono {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.student-list-container {
  max-width: 100%;
  padding: 0 8px;
}

.header-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02) 0%, rgba(var(--v-theme-primary), 0.05) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
}

.search-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.data-table-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.loading-card,
.error-card,
.empty-state-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

.hover-row {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
  transform: translateX(4px);
}

.hover-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.modern-table {
  font-family: 'Roboto', sans-serif;
}

.student-name-cell {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.email-cell {
  font-family: 'Roboto', sans-serif;
}

.action-buttons-cell {
  gap: 4px;
}

.mobile-cards {
  max-width: 100%;
}

.student-mobile-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.info-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-state-content {
  max-width: 500px;
  margin: 0 auto;
}

.max-width-400 {
  max-width: 400px;
  margin: 0 auto;
}

.empty-state-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.header-content {
  position: relative;
}

.pagination-card {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
}

:deep(.v-data-table-header__content) {
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-data-table-header__sort-icon) {
  opacity: 0.6 !important;
  transition: opacity 0.2s ease;
}

:deep(.v-data-table-header__content:hover .v-data-table-header__sort-icon) {
  opacity: 1 !important;
}

:deep(.v-data-table-header--sorted .v-data-table-header__sort-icon) {
  opacity: 1 !important;
  color: rgb(var(--v-theme-primary)) !important;
}

:deep(.v-data-table__td) {
  padding: 16px !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
}

:deep(.v-data-table__th) {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1) !important;
  padding: 16px !important;
}

:deep(.v-pagination) {
  justify-content: center;
}

:deep(.v-pagination__item) {
  margin: 0 2px;
  border-radius: 8px;
  font-weight: 500;
}

:deep(.v-pagination__item--is-active) {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

:deep(.v-pagination__item--is-active .v-btn__content) {
  color: white !important;
}

:deep(.v-alert) {
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
}

:deep(.v-chip) {
  font-weight: 500;
}

:deep(.v-avatar) {
  font-weight: 700;
}

@media (max-width: 960px) {
  .action-buttons {
    justify-content: center;
    width: 100%;
  }

  .header-content {
    text-align: center;
  }
}

@media (max-width: 600px) {
  .student-list-container {
    padding: 0 4px;
  }

  :deep(.v-pagination__item) {
    margin: 0 1px;
    min-width: 32px;
    height: 32px;
  }

  .empty-state-actions {
    flex-direction: column;
    align-items: center;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.student-mobile-card,
.data-table-card {
  animation: fadeIn 0.3s ease-out;
}
</style>