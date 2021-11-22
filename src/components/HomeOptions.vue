<template>
  <div :class="['main', faded ? 'main-fade' : '']" @transitionend.self="mainTransitionEnd">
    <template v-for="(setting, index) in settingsArray" :key="index">
      <w-toggle-switch v-model="settings[setting].value" :options="settings[setting].options" :ref="(el) => setSettingRef(el, index)"
                       :class="['switch', this.settingsDisplay[index] ? '' : 'switch-hidden']"
                       @update:modelValue="(val) => settings[setting].onChange(val)">
        {{ settings[setting].description }}
      </w-toggle-switch>
    </template>
  </div>
</template>

<script>
import WToggleSwitch from '/src/widgets/ToggleSwitch.vue'
import { asyncSetTimeout } from '/src/js/Utils'

const vibrationOptions = [
  {
    description: 'Off',
    value: 0
  },
  {
    description: 'Weak',
    value: 65
  },
  {
    description: 'Strong',
    value: 120
  }
]

const orientationOptions = [
  {
    description: 'Auto',
    value: 0,
    recommended: true
  },
  {
    description: 'Landscape',
    value: 1
  },
  {
    description: 'Portrait',
    value: 2
  }
]

const superSamplingOptions = [
  {
    description: '1x',
    value: 1
  },
  {
    description: '2x',
    value: 2
  },
  {
    description: '3x',
    value: 3,
    recommended: true
  },
  {
    description: '4x',
    value: 4
  }
]

const upscaleStyleOptions = [
  {
    description: 'Sharp',
    value: 'rendering-pixel'
  },
  {
    description: 'Smooth',
    value: 'rendering-quality',
    recommended: true
  }
]

const soundOptions = [
  {
    description: 'ON',
    value: false,
    recommended: true
  },
  {
    description: 'OFF',
    value: true
  }
]

const genericOptions = [
  {
    description: 'ON',
    value: true,
    recommended: true
  },
  {
    description: 'OFF',
    value: false
  }
]

export default {
  name: 'HomeColor',
  components: { WToggleSwitch },
  emits: ['done', 'back'],
  data: function () {
    return {
      settingsArray: [
        'vibration', 'orientation', 'sound', 'autoScale', 'mobileAssists', 'upscaleStyle', 'superSampling'
      ],
      settings: {
        vibration: {
          options: vibrationOptions,
          description: 'Rumble',
          onChange: this.changeVibration
        },
        orientation: {
          options: orientationOptions,
          description: 'Orient.',
          onChange: this.changeOrientation
        },
        sound: {
          options: soundOptions,
          description: 'Sound',
          onChange: this.changeSound
        },
        autoScale: {
          options: genericOptions,
          description: 'Auto Scale',
          onChange: this.changeAutoScale
        },
        mobileAssists: {
          options: genericOptions,
          description: 'Mobile Assists',
          onChange: this.changeMobileAssists
        },
        upscaleStyle: {
          options: upscaleStyleOptions,
          description: 'Bitmap Upscale',
          onChange: this.changeUpscaleStyle
        },
        superSampling: {
          options: superSamplingOptions,
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
        window.navigator.vibrate(val)
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
  flex: 1 1 min-content;
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
