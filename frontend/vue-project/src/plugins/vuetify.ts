import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Import Google Fonts
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/500.css'

// Custom theme configuration
const customTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    surface: '#FFFFFF',
    'on-surface': '#1C1B1F',
    'surface-variant': '#F3F3F3',
    'on-surface-variant': '#49454F',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      style: 'font-family: Roboto, sans-serif; font-weight: 500; text-transform: none;',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      style: 'font-family: Roboto, sans-serif;',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      style: 'font-family: Roboto, sans-serif;',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      style: 'font-family: Roboto, sans-serif;',
    },
    VCard: {
      style: 'font-family: Roboto, sans-serif;',
    },
    VCardTitle: {
      style: 'font-family: Roboto, sans-serif; font-weight: 600;',
    },
    VDataTable: {
      style: 'font-family: Roboto, sans-serif;',
    },
    VChip: {
      style: 'font-family: Roboto, sans-serif; font-weight: 500;',
    },
  },
})