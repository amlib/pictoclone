<template>
  <div :class="['view', this.renderingClass,
      this.isLandscape ? 'landscape' : undefined,
      this.globalValues.autoScale ? undefined : 'no-scale']"
       :style="getViewStyle" ref="view">
    <router-view/>
  </div>
</template>

<script>
import { throttle } from 'lodash'

const portraitConstrainRatio = 8 / 9
const landscapeBreakpointRatio = 18 / 9
const landscapeConstrainRatio = 24 / 9

export default {
  name: 'App',
  data: function () {
    return {
      globalValues: {
        colorHueDeg: 220,
        superSample: this.$superSample,
        autoScale: true
      },
      // renderingClass: 'rendering-pixel', // should be used with no super sampling
      renderingClass: 'quality', // use super sampling 2x or 3x with this
      patchingTiles: true, // kludge for "glitchyness" when changing tiles
      documentWidth: 1,
      documentHeight: 1,
      viewWidth: 1,
      viewHeight: 1
    }
  },
  created: function () {
    this.portraitConstrainRatio = portraitConstrainRatio
    this.landscapeBreakpointRatio = landscapeBreakpointRatio
    this.landscapeConstrainRatio = landscapeConstrainRatio
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
    isLandscape: function () {
      return (this.documentWidth / this.documentHeight) > (this.landscapeBreakpointRatio)
    },
    getScalingFactor: function () {
      const documentRatio = this.documentWidth / this.documentHeight
      if (this.isLandscape) {
        return this.documentWidth / this.viewWidth * Math.min((this.landscapeConstrainRatio / documentRatio), 1)
      } else {
        return this.documentWidth / this.viewWidth * Math.min((this.portraitConstrainRatio / documentRatio), 1)
      }
    },
    getViewStyle: function () {
      const marginCompensation = (this.documentWidth - (this.viewWidth * this.getScalingFactor)) / 2
      const obj = {
        '--global-chd': this.globalValues.colorHueDeg + 'deg',
        '--global-ss': this.globalValues.superSample,
        '--global-sf': this.getScalingFactor,
        visibility: this.patchingTiles ? 'hidden' : null
      }

      if (this.globalValues.autoScale) {
        obj.marginLeft = marginCompensation + 'px'
        obj.marginRight = undefined
        obj.transform = `scale(${this.getScalingFactor})`
      }
      return obj
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
      this.documentHeight = document.firstElementChild.offsetHeight
      if (this.$refs.view) {
        this.viewWidth = this.$refs.view.offsetWidth
        this.viewHeight = this.$refs.view.offsetHeight
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
  background-color: black;
}

#app {
  height: 100%;
  overflow: hidden;
}

.no-scale {
  margin: 0 auto;
}

.view {
  width: min-content;
  transform-origin: top left;
  height: 100%;
}

.globalColorHueTint {
  filter: hue-rotate(var(--global-chd));
}

.pixel-rendering {
  image-rendering: pixelated;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
