import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import mapper from './mapper'

createApp(App).use(router).use(mapper).mount('#app')
