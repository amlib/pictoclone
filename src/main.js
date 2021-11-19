import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import mapper from './mapper'

const main = async function () {
  const mapperOptions = {
    superSample: 3,
    imageSource: 'tilemap.png'
  }

  await mapper.generate(mapperOptions)
  createApp(App).use(router).use(mapper, mapperOptions).mount('#app')
}

main()
