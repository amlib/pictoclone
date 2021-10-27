<template>
  <div ref="view" class="view" :style="getViewStyle">
    <router-view/>
  </div>
</template>

<script>
import { throttle } from 'lodash'

export default {
  name: 'App',
  data: function () {
    return {
      globalValues: {
        colorHueDeg: 220,
        superSample: this.$superSample,
        autoScale: true
      },
      patchingTiles: true, // kludge for "glitchyness" when changing tiles
      documentObserver: null,
      viewObserver: null,
      documentWidth: 1,
      viewWidth: 1
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
  mounted: function () {
    this.onResizeThrottled = throttle(this.onResize, 16, { leading: false, trailing: true })
    this.documentObserver = new ResizeObserver(this.onResizeThrottled).observe(document.firstElementChild)
    this.viewObserver = new ResizeObserver(this.onResizeThrottled).observe(this.$refs.view)
  },
  beforeUnmount: function () {
    if (this.documentObserver) {
      this.documentObserver.unobserve(document.firstElementChild.offsetWidth)
    }
    if (this.viewObserver) {
      this.viewObserver.unobserve(this.$refs.view)
    }
    this.onResizeThrottled.cancel()
    this.onResizeThrottled = undefined
  },
  computed: {
    getScalingFactor: function () {
      return this.documentWidth / Math.max(this.viewWidth, 256)
    },
    getViewStyle: function () {
      return {
        '--global-chd': this.globalValues.colorHueDeg + 'deg',
        '--global-ss': this.globalValues.superSample,
        '--global-sf': this.getScalingFactor,
        '--global-isf': 1 / this.getScalingFactor,
        visibility: this.patchingTiles ? 'hidden' : null,
        marginLeft: this.globalValues.autoScale ? undefined : 'auto',
        marginRight: this.globalValues.autoScale ? undefined : 'auto',
        transform: this.globalValues.autoScale ? `scale(${this.getScalingFactor})` : undefined
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
    },
    onResize: function () {
      this.documentWidth = document.firstElementChild.offsetWidth
      if (this.$refs.view) {
        this.viewWidth = this.$refs.view.offsetWidth
      }
    }
  }
}
</script>

<style>
* {
  font-family: NDS12, serif;
  font-size: calc(10px * var(--global-ss));
  font-smooth: never;
  -webkit-font-smoothing : none;
}

html {
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  touch-action: pan-y;
  overflow-x: hidden;
  height: 100%;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
