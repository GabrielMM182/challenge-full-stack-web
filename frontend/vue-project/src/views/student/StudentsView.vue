<template>
  <v-container fluid class="pa-6">
    <StudentList />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import StudentList from '@/components/student/StudentList.vue'

export default defineComponent({
  name: 'StudentsView',
  
  components: {
    StudentList
  }
})
</script>