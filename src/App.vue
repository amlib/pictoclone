<template>
  <div :class="['app-view',
      this.globalValues.renderingClass,
      this.isLandscape ? 'landscape' : 'portrait',
      !this.globalValues.autoScale && 'no-scale',
      this.globalValues.mobileAssists && 'mobile-assists']"
       :style="getAppViewStyle" ref="app-view">
    <div v-if="loading" class="loading">
      <div class="loading-circle"/>
      {{ loadingMessage }}...
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" @before-enter="beforeEnterTransition">
        <component v-if="!coldStart" :is="Component" :style="getViewStyle"/>
      </transition>
    </router-view>
    <div id="modal-teleport-target" class="modal" :style="getViewStyle"></div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { colorsHexL1, colorsHexL2, colorsCssHueDeg, colorsHexMain, colorsHexFaded } from '/src/js/Colors'
import { AudioFX } from '/src/audio'
import { ChatClient } from '/src/chat'
import tileMap from '/tilemap.png'
import { pokeNames, sillyLoadingMessages } from './js/Strings'

export default {
  name: 'App',
  data: function () {
    let isTouchScreen = this.isTouchScreen()
    return {
      globalValues: {
        superSample: isTouchScreen ? 2 : 3,
        setSuperSample: this.setSuperSample,
        autoScale: true,
        mobileAssists: isTouchScreen,
        isTouchScreen: isTouchScreen,
        isLandscape: computed(() => this.isLandscape),
        scalingFactor: computed(() => this.getScalingFactor),
        userColorIndex: Math.round((colorsHexL2.length - 1) * Math.random()),
        userName: '',
        vibration: 120,
        setVibration: this.setVibration,
        muted: false,
        setVolume: this.setVolume,
        // renderingClass: 'rendering-pixel', // should be used with no super sampling
        renderingClass: 'rendering-quality', // use super sampling 2x or 3x with this
        rgbMode: false,
        setRgbMode: this.setRgbMode,
        rgbColorHueDeg: 0,
        audio: undefined,
        orientation: 0,
        chromeFix: this.getBrowserEngine().match(/(chrome)/) != null,
        showGithubLink: true,
        chatClient: new ChatClient(),
        chatQueueLimit: 64,
        roomCode: '',
        serverAddress: import.meta.env.DEV ? 'localhost:9001' : 'localhost:9001'
      },
      loading: true,
      coldStart: true,
      documentWidth: 1,
      documentHeight: 1,
      appViewWidth: 1,
      appViewHeight: 1,
      landscapeBreakpointRatio: 18 / 9,
      landscapeConstrainRatio: 26 / 9,
      portraitConstrainRatio: 8 / 9
    }
  },
  created: function () {
    this.$.root.appContext.config.globalProperties.$global = this.globalValues
    this.globalValues.audio = new AudioFX(this.globalValues.vibration, this.globalValues.muted ? 0.0 : 1.0)
    this.globalValues.userName = this.getRandomName()

    this.$watch(() => this.globalValues.autoScale, () => {
      const appEl = document.getElementById('app')
      if (this.globalValues.autoScale) {
        appEl.classList.add('app-overflow')
        appEl.scroll(0,0)
      } else {
        appEl.classList.remove('app-overflow')
      }
    }, {
      immediate: true
    })
  },
  mounted: async function () {
    requestAnimationFrame(() => { this.onResize() })

    await this.$mapperGenerate({
      superSample: this.globalValues.superSample,
      imageSource: tileMap
    })
    await this.globalValues.audio.loadSamples()

    this.loading = false
    this.coldStart = false

    this.onResizeThrottled = () => requestAnimationFrame(() => { this.onResize() })
    this.documentObserver = new ResizeObserver(this.onResizeThrottled).observe(document.firstElementChild)
    this.appViewObserver = new ResizeObserver(this.onResizeThrottled).observe(this.$refs['app-view'])
  },
  beforeUnmount: function () {
    if (this.documentObserver) {
      this.documentObserver.unobserve(document.firstElementChild.offsetWidth)
    }
    if (this.appViewObserver) {
      this.appViewObserver.unobserve(this.$refs['app-view'])
    }
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
      return colorsCssHueDeg[this.globalValues.userColorIndex]
    },
    getScalingFactor: function () {
      if (!this.globalValues.autoScale) {
        return 1
      }
      const documentRatio = this.documentWidth / this.documentHeight
      if (this.isLandscape) {
        return this.documentWidth / this.appViewWidth * Math.min((this.landscapeConstrainRatio / documentRatio), 1)
      } else {
        return this.documentWidth / this.appViewWidth * Math.min((this.portraitConstrainRatio / documentRatio), 1)
      }
    },
    getViewStyle: function () {
      return {
        height: this.globalValues.autoScale ? `calc(${this.documentHeight}px * 1 / var(--global-sf))` : undefined,
        visibility: this.loading ? 'hidden' : null
      }
    },
    getAppViewStyle: function () {
      const marginCompensation = (this.documentWidth - (this.appViewWidth * this.getScalingFactor)) / 2
      const colorIndex = this.globalValues.userColorIndex
      const obj = {
        '--global-cl1': colorsHexL1[colorIndex],
        '--global-cl2': colorsHexL2[colorIndex],
        '--global-cmain': colorsHexMain[colorIndex],
        '--global-cfaded': colorsHexFaded[colorIndex],
        '--global-ss': this.globalValues.superSample,
        '--global-sf': this.getScalingFactor,
        '--global-chd': this.colorHueDeg + 'deg',
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
      // meant to be used together with a 0.5s transition property on select elements
      if (timestamp - this.rgbAnimationTimestamp > 495) {
        this.globalValues.rgbColorHueDeg += 120
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
        this.globalValues.rgbColorHueDeg = 0
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
      if (this.$refs['app-view']) {
        this.appViewWidth = this.$refs['app-view'].offsetWidth
        this.appViewHeight = this.$refs['app-view'].offsetHeight
      }
    },
    beforeEnterTransition: function () {
      this.landscapeBreakpointRatio = this.$route.meta.landscapeBreakpointRatio
      this.landscapeConstrainRatio = this.$route.meta.landscapeConstrainRatio
      this.portraitConstrainRatio = this.$route.meta.portraitConstrainRatio
    },
    getRandomName: function () {
      return pokeNames[Math.round(Math.random() * (pokeNames.length - 1))]
    },
    getBrowserEngine: function () {
      let UA = navigator.userAgent
      if (/Gecko\/[0-9.-]+/.test(UA)) {
        return 'gecko'
      } else if (/Chrome\/[0-9.-]+/.test(UA)) {
        return 'chrome'
      } else if (/AppleWebKit\/[0-9.-]+/.test(UA)) {
        return 'webkit'
      } else {
        return 'other'
      }
    },
    isTouchScreen: function () {
      if ("maxTouchPoints" in navigator || "msMaxTouchPoints" in navigator) {
        return navigator.maxTouchPoints > 0
      } else {
        return false
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
  touch-action: auto;
  overflow-x: hidden;
  height: 100%;
  background-color: black;
}

#app {
  height: 100%;
  overflow-y: hidden;
}

.app-overflow {
  overflow-x: hidden;
}

.no-scale {
  margin: 0 auto;
}

.app-view {
  width: min-content;
  transform-origin: top left;
  height: 100%;
  /* speeds up autoscales css scale transform, some browsers needs this to trigger faster rendering (chrome/webkit)
   also eliminates scaling artifacts in webkit. Was supposed to eliminate in chrome but does not!*/
  backface-visibility: hidden;
  will-change: transform;
}

.global-rgb {
  will-change: filer;
  transition: filter 0.5s linear;
  /*image-rendering: pixelated;*/
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

.modal {
  position: absolute;
  inset: 0;
  touch-action: none;
  pointer-events: none;
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

@font-face {
  font-family: 'NDS12';
  src: url('/nds12/NDS12.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

.text-recommended {
  opacity: 1.0;
  animation-duration: 0.7s;
  animation-name: highlight;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
}

@keyframes highlight {
  from {
    opacity: 1.0;
    color: cyan;
  }
  to {
    opacity: 0.7;
    color: blue;
  }
}
</style>
