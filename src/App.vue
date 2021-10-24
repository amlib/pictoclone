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
        superSample: 2
      }
    }
  },
  created: function () {
    this.$.root.appContext.config.globalProperties.$global = this.globalValues
    // Since we get reactive across the entire app... uncomment for RGB mode lol
    // setInterval(() => { this.globalValues.colorHueDeg += 15 }, 100)
  },
  computed: {
    getStyle: function () {
      return {
        '--global-chd': this.globalValues.colorHueDeg,
        '--global-ss': this.globalValues.superSample
      }
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
