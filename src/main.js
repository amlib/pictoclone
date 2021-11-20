import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import mapper from './mapper'
import tileMap from '/tilemap.png'

const main = async function () {
  const mapperOptions = {
    superSample: 3,
    imageSource: tileMap
  }

  await mapper.generate(mapperOptions)
  createApp(App).use(router).use(mapper, mapperOptions).mount('#app')
}

main()
