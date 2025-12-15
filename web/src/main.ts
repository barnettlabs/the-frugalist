import '@/assets/css/app.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'

const app = createApp(App)

// Setup Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Setup Vue Router
app.use(router)

// Mount the app
app.mount('#app')
