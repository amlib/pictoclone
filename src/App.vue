<template>
  <div :class="['view',
      this.globalValues.renderingClass,
      this.isLandscape ? 'landscape' : 'portrait',
      this.globalValues.autoScale ? undefined : 'no-scale',
      this.globalValues.mobileAssists ? 'mobile-assists' : undefined]"
       :style="getAppStyle" ref="view">
    <div v-if="patchingTiles" class="loading-circle"/>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" @before-enter="beforeEnterTransition">
        <component :is="Component" :style="getViewStyle"/>
      </transition>
    </router-view>
  </div>
</template>

<script>
import { throttle } from 'lodash'
import { computed } from 'vue'
import { colorsCssHueDeg, colorsHex, colorsHexFaded } from '@/js/Colors'

export default {
  name: 'App',
  data: function () {
    return {
      globalValues: {
        colorHueDeg: computed(() => this.colorHueDeg),
        superSample: this.$superSample,
        setSuperSample: this.setSuperSample,
        autoScale: true,
        mobileAssists: true,
        isLandscape: computed(() => this.isLandscape),
        userColorIndex: 2,
        userName: 'amlib',
        vibration: 0,
        sound: true,
        // renderingClass: 'rendering-pixel', // should be used with no super sampling
        renderingClass: 'rendering-quality', // use super sampling 2x or 3x with this
        rgbMode: false,
        setRgbMode: this.setRgbMode
      },
      patchingTiles: false, // kludge for "glitchyness" when changing tiles
      documentWidth: 1,
      documentHeight: 1,
      viewWidth: 1,
      viewHeight: 1,
      landscapeBreakpointRatio: 18 / 9,
      landscapeConstrainRatio: 26 / 9,
      portraitConstrainRatio: 8 / 9,
      rgbColorIndex: 2,
      rgbColorHue: 0,
      rgbInterval: undefined
    }
  },
  created: function () {
    this.$.root.appContext.config.globalProperties.$global = this.globalValues
  },
  mounted: function () {
    this.$.root.appContext.config.globalProperties.$isLandscape = this.isLandscape
    this.onResizeThrottled = throttle(this.onResize, 100, { leading: false, trailing: true })
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
    colorHueDeg: function () {
      if (this.rgbInterval) {
        return this.rgbColorHue
      } else {
        const colorIndex = this.globalValues.userColorIndex
        return colorsCssHueDeg[colorsHex[colorIndex]]
      }
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
      return {
        height: this.$global.autoScale ? `calc(${this.documentHeight}px * 1 / var(--global-sf))` : undefined,
        visibility: this.patchingTiles ? 'hidden' : null
      }
    },
    getAppStyle: function () {
      const marginCompensation = (this.documentWidth - (this.viewWidth * this.getScalingFactor)) / 2
      const colorIndex = this.rgbInterval ? this.rgbColorIndex : this.globalValues.userColorIndex

      const obj = {
        '--global-c1': colorsHex[colorIndex],
        '--global-c2': colorsHexFaded[colorIndex],
        // '--global-cf': colorsCssFilter[colorsHex[colorIndex]],
        '--global-chd': this.colorHueDeg + 'deg',
        '--global-ss': this.globalValues.superSample,
        '--global-sf': this.getScalingFactor
      }

      if (this.globalValues.autoScale) {
        obj.marginLeft = marginCompensation + 'px'
        obj.marginRight = marginCompensation + 'px'
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
      }, 100)
    },
    setRgbMode: function (val) {
      if (this.rgbInterval) {
        clearInterval(this.rgbInterval)
        this.rgbInterval = undefined
        this.rgbColorHue = 0
        this.rgbColorIndex = 2
      }

      if (val) {
        this.rgbInterval = setInterval(() => {
          this.rgbColorHue += 5

          if (this.rgbColorHue % 30 === 0) {
            this.rgbColorIndex += 1
            if (this.rgbColorIndex > colorsHex.length - 1) {
              this.rgbColorIndex = 2
            }
          }
        }, 33)
      }
    },
    onResize: function () {
      this.documentWidth = document.firstElementChild.offsetWidth
      this.documentHeight = document.firstElementChild.offsetHeight
      if (this.$refs.view) {
        this.viewWidth = this.$refs.view.offsetWidth
        this.viewHeight = this.$refs.view.offsetHeight
      }
    },
    beforeEnterTransition: function () {
      this.landscapeBreakpointRatio = this.$route.meta.landscapeBreakpointRatio
      this.landscapeConstrainRatio = this.$route.meta.landscapeConstrainRatio
      this.portraitConstrainRatio = this.$route.meta.portraitConstrainRatio
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
  touch-action: auto;
  height: 100%;
  background-color: black;
}

#app {
  height: 100%;
  overflow-y: hidden;
}

.no-scale {
  margin: 0 auto;
}

.view {
  width: min-content;
  transform-origin: top left;
  height: 100%;
}

.global-color-hue-tint {
  filter: hue-rotate(var(--global-chd));
}

/*.global-color-tint {*/
/*  filter: var(--global-cf);*/
/*}*/

.pixel-rendering {
  image-rendering: pixelated;
}

.simple-button-normal {
  background-color: #A2A2A2;
}

.simple-button-active {
  background-color: #FB3041;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-circle {
  margin: 100px 400px;
  transform: translate(200px, 0);
  animation: effect 0.5s linear infinite;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
}

@keyframes effect {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
