import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from '@/plugins'

// Import global typography styles
import '@/assets/styles/typography.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
