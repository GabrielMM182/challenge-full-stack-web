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

    <v-row class="mb-4" align="end">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Buscar por nome, email, RA ou CPF"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          @input="handleSearch"
          @click:clear="clearSearch"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="pagination.limit"
          :items="itemsPerPageOptions"
          label="Itens por página"
          variant="outlined"
          density="compact"
          @update:model-value="handleItemsPerPageChange"
        />
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
        :sort-by="sortBy"
        class="elevation-0"
        item-key="id"
        no-data-text="Nenhum estudante encontrado"
        loading-text="Carregando estudantes..."
        show-select="false"
        @update:sort-by="handleSortChange"
      >
        <template #item.name="{ item }">
          <div 
            class="d-flex align-center cursor-pointer hover-row"
            @click="handleViewStudent(item)"
          >
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-white text-body-2">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium text-primary">{{ item.name }}</div>
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
        class="mb-3 elevation-2 cursor-pointer hover-card"
        @click="handleViewStudent(student)"
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
              <div class="font-weight-medium text-body-1 text-primary">{{ student.name }}</div>
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

    <v-row v-if="pagination.totalPages > 1" class="mt-4" justify="center">
      <v-col cols="auto">
        <v-pagination
          v-model="pagination.page"
          :length="pagination.totalPages"
          :total-visible="isMobile ? 5 : 7"
          @update:model-value="handlePageChange"
        />
      </v-col>
    </v-row>

    <v-row v-if="students.length > 0" class="mt-2" justify="center">
      <v-col cols="auto">
        <p class="text-body-2 text-grey">
          Mostrando {{ getStartItem() }} - {{ getEndItem() }} de {{ pagination.total }} estudantes
        </p>
      </v-col>
    </v-row>

    <!-- Student Details Modal -->
    <StudentDetailsModal
      v-model="showDetailsModal"
      :student-id="selectedStudentId"
      @edit-student="handleEditStudent"
    />
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import { useDisplay } from 'vuetify'
import { studentService } from '@/services'
import type { Student, StudentQueryParams } from '@/types'
import StudentDetailsModal from './StudentDetailsModal.vue'

export default defineComponent({
  name: 'StudentList',
  
  components: {
    StudentDetailsModal
  },
  
  setup() {
    const { mobile } = useDisplay()
    return { isMobile: mobile }
  },

  data() {
    return {
      students: [] as Student[],
      isLoading: false,
      error: null as string | null,
      showDetailsModal: false,
      selectedStudentId: null as string | null,
      searchQuery: '',
      searchTimeout: null as NodeJS.Timeout | null,
      sortBy: [{ key: 'name', order: 'asc' }],
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
.text-mono {
  font-family: 'Roboto Mono', monospace;
}

.mobile-cards {
  max-width: 100%;
}

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.2s ease;
}

:deep(.v-data-table-header__content) {
  position: relative;
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
}

:deep(.v-pagination) {
  justify-content: center;
}

:deep(.v-pagination__item) {
  margin: 0 2px;
}

@media (max-width: 600px) {
  :deep(.v-pagination__item) {
    margin: 0 1px;
    min-width: 32px;
    height: 32px;
  }
}
</style>