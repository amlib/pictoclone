<template>
  <div :class="['view',
      this.globalValues.renderingClass,
      this.isLandscape ? 'landscape' : 'portrait',
      this.globalValues.autoScale ? undefined : 'no-scale',
      this.globalValues.mobileAssists ? 'mobile-assists' : undefined]"
       :style="getAppStyle" ref="view">
    <div v-if="loading" class="loading">
      <div class="loading-circle"/>
      {{ loadingMessage }}...
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" @before-enter="beforeEnterTransition">
        <component v-if="!coldStart" :is="Component" :style="getViewStyle"/>
      </transition>
    </router-view>
  </div>
</template>

<script>
import { throttle } from 'lodash'
import { computed } from 'vue'
import { colorsHexL1, colorsHexL2, colorsCssHueDeg, colorsHexMain, colorsHexFaded } from '/src/js/Colors'
import { AudioFX } from '/src/audio'
import tileMap from '/tilemap.png'
import { pokeNames, sillyLoadingMessages } from './js/Strings'

export default {
  name: 'App',
  data: function () {
    return {
      globalValues: {
        colorHueDeg: computed(() => this.colorHueDeg),
        superSample: 3,
        setSuperSample: this.setSuperSample,
        autoScale: true,
        mobileAssists: true,
        isLandscape: computed(() => this.isLandscape),
        scalingFactor: computed(() => this.getScalingFactor),
        userColorIndex: 2,
        userName: '',
        vibration: 120,
        setVibration: this.setVibration,
        muted: false,
        setVolume: this.setVolume,
        // renderingClass: 'rendering-pixel', // should be used with no super sampling
        renderingClass: 'rendering-quality', // use super sampling 2x or 3x with this
        rgbMode: false,
        setRgbMode: this.setRgbMode,
        audio: undefined,
        orientation: 0
      },
      loading: true,
      coldStart: true,
      documentWidth: 1,
      documentHeight: 1,
      viewWidth: 1,
      viewHeight: 1,
      landscapeBreakpointRatio: 18 / 9,
      landscapeConstrainRatio: 26 / 9,
      portraitConstrainRatio: 8 / 9,
      rgbColorHue: 0
    }
  },
  created: function () {
    this.$.root.appContext.config.globalProperties.$global = this.globalValues
    this.globalValues.audio = new AudioFX(this.globalValues.vibration, !this.globalValues.muted)
    this.globalValues.userName = this.getRandomName()
  },
  mounted: async function () {
    this.onResize()

    await this.$mapperGenerate({
      superSample: this.globalValues.superSample,
      imageSource: tileMap
    })
    await this.globalValues.audio.loadSamples({})

    this.loading = false
    this.coldStart = false

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
      if (this.globalValues.orientation <= 0) {
        return (this.documentWidth / this.documentHeight) > (this.landscapeBreakpointRatio)
      } else if (this.globalValues.orientation === 1) {
        return true
      } else {
        return false
      }
    },
    colorHueDeg: function () {
      if (this.globalValues.rgbMode) {
        return this.rgbColorHue
      } else {
        return colorsCssHueDeg[this.globalValues.userColorIndex]
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
        visibility: this.loading ? 'hidden' : null,
        '--global-chd': this.colorHueDeg + 'deg', // defining here rather than at the root element speeds up firefox when rgb mode is constantly changing this style
      }
    },
    getAppStyle: function () {
      const marginCompensation = (this.documentWidth - (this.viewWidth * this.getScalingFactor)) / 2
      const colorIndex = this.globalValues.userColorIndex
      const obj = {
        '--global-cl1': colorsHexL1[colorIndex],
        '--global-cl2': colorsHexL2[colorIndex],
        '--global-cmain': colorsHexMain[colorIndex],
        '--global-cfaded': colorsHexFaded[colorIndex],
        '--global-ss': this.globalValues.superSample,
        '--global-sf': this.getScalingFactor
      }

      if (this.globalValues.autoScale) {
        obj.marginLeft = marginCompensation + 'px'
        obj.marginRight = marginCompensation + 'px'
        obj.transform = `scale(${this.getScalingFactor})`
      }
      return obj
    },
    loadingMessage: function () {
      this.loading
      return sillyLoadingMessages[Math.round(Math.random() * (sillyLoadingMessages.length - 1))]
    }
  },
  methods: {
    setSuperSample: async function (newValue) {
      this.loading = true
      this.$nextTick(() => this.onResize())
      await this.$mapperGenerate({ superSample: newValue })
      this.globalValues.superSample = newValue
      setTimeout(() => {
        this.loading = false
      }, 500)
    },
    processRgb: function (timestamp) {
      if (timestamp - this.rgbAnimationTimestamp > 25) {
        this.rgbColorHue += 5
        this.rgbAnimationTimestamp = timestamp
      }
      if (this.globalValues.rgbMode) {
        this.rgbAnimationRef = requestAnimationFrame(this.processRgb)
      }
    },
    setRgbMode: function (val) {
      if (val) {
        this.globalValues.rgbMode = true
        this.rgbAnimationTimestamp = 0
        this.rgbAnimationRef = requestAnimationFrame(this.processRgb)
      } else {
        this.rgbColorHue = 0
        this.globalValues.rgbMode = false
        window.cancelAnimationFrame(this.rgbAnimationRef)
        this.rgbAnimationRef = undefined
      }
    },
    setVolume: function (vol) {
      this.globalValues.audio.setVolume(vol)
      this.globalValues.muted = vol <= 0
    },
    setVibration: function (strength) {
      this.globalValues.audio.setVibrationStrength(strength)
      this.globalValues.vibration = strength
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
    },
    getRandomName: function () {
      return pokeNames[Math.round(Math.random() * (pokeNames.length - 1))]
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

.pixel-rendering {
  image-rendering: pixelated;
}

.simple-button-normal {
  background-color: #A2A2A2;
}

.simple-button-active {
  background-color: var(--global-cl2);
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
  margin: 100px 500px;
  transform: translate(200px, 0);
  animation: effect 0.5s linear infinite;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 12px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
}

.loading {
  color: #cbcbcb;
  text-align: center;
  font-size: calc(10px * 5);
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
