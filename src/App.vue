<template>
  <div id="nav" :style="getStyle">
    <router-link to="/">Home</router-link> |
    <router-link to="/chat">Chat</router-link>
  </div>
  <router-view :style="getStyle"/>
</template>
<script>

export default {
  name: 'App',
  data: function () {
    return {
      globalValues: {
        colorHueDeg: 220,
        superSample: this.$superSample
      },
      patchingTiles: true // kludge for "glitchyness" when changing tiles
    }
  },
  created: function () {
    this.$.root.appContext.config.globalProperties.$global = this.globalValues
    // Since we get reactive across the entire app... uncomment for RGB mode lol
    // setInterval(() => { this.globalValues.colorHueDeg += 15 }, 50)

    setTimeout(() => { this.patchingTiles = false }, 200)
    // setInterval(() => {
    //   this.setSuperSample(this.globalValues.superSample === 2 ? 1 : 2)
    // }, 1500)
  },
  computed: {
    getStyle: function () {
      return {
        '--global-chd': this.globalValues.colorHueDeg + 'deg',
        '--global-ss': this.globalValues.superSample,
        visibility: this.patchingTiles ? 'hidden' : null
      }
    }
  },
  methods: {
    setSuperSample: async function (newValue) {
      this.patchingTiles = true
      await this.$mapperRegenerate({ superSample: newValue })
      this.globalValues.superSample = newValue
      setTimeout(() => {
        this.patchingTiles = false
      }, 150)
    }
  }
}
</script>

<style>
#app {
  /*font-family: Avenir, Helvetica, Arial, sans-serif;*/
  /*-webkit-font-smoothing: antialiased;*/
  /*-moz-osx-font-smoothing: grayscale;*/
  /*text-align: center;*/
  /*color: #2c3e50;*/
}

#nav {
  padding: 10px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
