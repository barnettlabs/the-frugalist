import '@/assets/css/app.css';

import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from '@/App.vue';
import router from '@/router';

const app = createApp(App);

// Setup Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Setup Vue Router
app.use(router);

// Mount the app
app.mount('#app');
