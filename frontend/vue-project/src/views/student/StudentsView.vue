<template>
  <v-container fluid class="pa-6">
    <StudentList />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { StudentList } from '@/components'

export default defineComponent({
  name: 'StudentsView',
  
  components: {
    StudentList
  }
})
</script>