<template>
  <div :class="['main', faded && 'main-fade']" @transitionend.self="mainTransitionEnd">
    <template v-for="(setting, index) in settingsArray" :key="index">
      <w-toggle-switch v-model="settings[setting].value" :options="settings[setting].options" :ref="(el) => setSettingRef(el, index)"
                       :class="['switch', !this.settingsDisplay[index] && 'switch-hidden']"
                       @update:modelValue="(val) => settings[setting].onChange(val)">
        {{ settings[setting].description }}
      </w-toggle-switch>
    </template>
  </div>
</template>

<script>
import WToggleSwitch from '/src/widgets/ToggleSwitch.vue'
import { asyncSetTimeout } from '/src/js/Utils'
import { cloneDeep } from 'lodash'
import { computed } from 'vue'
import * as options from '/src/js/Options.js'

export default {
  name: 'HomeColor',
  components: { WToggleSwitch },
  emits: ['done', 'back'],
  data: function () {
    let isTouchScreen = this.$global.isTouchScreen
    options.mobileAssists[0].recommended = isTouchScreen
    options.mobileAssists[1].recommended = !isTouchScreen

    return {
      settingsArray: [
        'vibration', 'orientation', 'sound', 'autoScale', 'mobileAssists', 'upscaleStyle', 'superSampling'
      ],
      settings: {
        vibration: {
          options: options.vibration,
          description: 'Rumble',
          onChange: this.changeVibration
        },
        orientation: {
          options: options.orientation,
          description: 'Orient.',
          onChange: this.changeOrientation
        },
        sound: {
          options: options.sound,
          description: 'Sound',
          onChange: this.changeSound
        },
        autoScale: {
          options: options.generic,
          description: 'Auto Scale',
          onChange: this.changeAutoScale
        },
        mobileAssists: {
          options: options.mobileAssists,
          description: 'Mobile Assists',
          onChange: this.changeMobileAssists
        },
        upscaleStyle: {
          options: options.upscaleStyle,
          description: 'Bitmap Upscale',
          onChange: this.changeUpscaleStyle
        },
        superSampling: {
          options: computed(() => this.superSamplingOptions),
          description: 'Super Sampling',
          onChange: this.changeSuperSampling
        }
      },
      vibration: undefined,
      settingsRefs: [],
      settingsDisplay: [],
      faded: true
    }
  },
  computed: {
    superSamplingOptions: function () {
      const renderingClass = this.$global.renderingClass
      const superSamplingOptionsCopy = cloneDeep(options.superSampling)
      if (renderingClass === 'rendering-quality') {
        superSamplingOptionsCopy[2].recommended = true
      } else if (renderingClass === 'rendering-pixel') {
        superSamplingOptionsCopy[1].recommended = true
      }
      return superSamplingOptionsCopy
    }
  },
  created: function () {
  },
  mounted: function () {
    this.settings.vibration.value = this.$global.vibration
    this.settings.orientation.value = this.$global.orientation
    this.settings.sound.value = this.$global.muted
    this.settings.autoScale.value = this.$global.autoScale
    this.settings.mobileAssists.value = this.$global.mobileAssists
    this.settings.upscaleStyle.value = this.$global.renderingClass
    this.settings.superSampling.value = this.$global.superSample

    setTimeout(() => { this.faded = false }, 16)
    this.settingsDisplayEffect([...Array(Object.keys(this.settings).length).keys()], true)
  },
  methods: {
    done: async function () {
      await this.settingsDisplayEffect([...Array(Object.keys(this.settings).length).keys()].reverse(), false)
      this.mainTransitionEndCallback = () => { this.$emit('done') }
      this.faded = true
    },
    back: async function () {
      await this.settingsDisplayEffect([...Array(Object.keys(this.settings).length).keys()].reverse(), false)
      this.mainTransitionEndCallback = () => { this.$emit('back') }
      this.faded = true
    },
    mainTransitionEnd: function (event) {
      // will trigger for both opacity and transform properties, filter it
      if (event.propertyName === 'opacity') {
        if (this.mainTransitionEndCallback) {
          this.mainTransitionEndCallback()
          this.mainTransitionEndCallback = undefined
        }
      }
    },
    setSettingRef: function (el, index) {
      this.settingsRefs[index] = el
    },
    settingsDisplayEffect: async function (displayOrder, value) {
      for (let i = 0; i < displayOrder.length; ++i) {
        await asyncSetTimeout(66)
        this.settingsDisplay[displayOrder[i]] = value
      }
    },
    changeVibration: function (val) {
      this.$global.setVibration(val)
      if (val > 0) {
        window.navigator.vibrate && window.navigator.vibrate(val)
      }
    },
    changeSound: function (muted) {
      this.$global.setVolume(muted ? 0.0 : 1.0)
    },
    changeOrientation: function (val) {
      this.$global.orientation = val
    },
    changeAutoScale: function (val) {
      this.$global.autoScale = val
    },
    changeMobileAssists: function (val) {
      this.$global.mobileAssists = val
    },
    changeUpscaleStyle: function (val) {
      this.$global.renderingClass = val
    },
    changeSuperSampling: function (val) {
      this.$global.setSuperSample(val)
    }
  }
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  /*justify-content: space-between;*/
  flex-wrap: wrap;
  padding-left: calc(8px * var(--global-ss));
  padding-right: calc(7px * var(--global-ss));
  align-items: center;
  transition: opacity 0.25s linear, transform 0.25s linear;
}

.main-fade {
  opacity: 0;
  transform: translateY(calc(16px * var(--global-ss)));
}

.main > div {
  /*flex: 1 1 min-content;*/
  /*flex: 1 1 auto;*/
  flex: calc(86px * var(--global-ss)) 1 0;
  margin: calc(7px * var(--global-ss)) calc(7px * var(--global-ss));
}

.switch {
  transition: opacity 0.25s linear, transform 0.25s linear;
}

.switch-hidden {
  opacity: 0;
  transform: translateY(calc(16px * var(--global-ss)));
}
</style>
