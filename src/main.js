import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mapper from './mapper'

const main = async function () {
  await mapper.init()
  createApp(App).use(store).use(router).use(mapper).mount('#app')
}

main()
