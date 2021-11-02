<template>
  <div :class="['main', faded ? 'main-fade' : '']" @transitionend.self="mainTransitionEnd">
    <template v-for="(setting, index) in settingsArray" :key="index">
      <w-toggle-switch v-model="settings[setting].value" :options="settings[setting].options" :ref="(el) => setSettingRef(el, index)"
                       :class="['switch', this.settingsDisplay[index] ? '' : 'switch-hidden']">
        {{ settings[setting].description }}
      </w-toggle-switch>
    </template>
  </div>
</template>

<script>
import WToggleSwitch from '@/widgets/ToggleSwitch'
import { asyncSetTimeout } from '@/js/Utils'

const vibrationOptions = [
  {
    description: 'Off',
    value: 0
  },
  {
    description: 'Weak',
    value: 1
  },
  {
    description: 'Strong',
    value: 2
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
        'vibration', 'orientation', 'sound', 'autoScale', 'mobileAssists', 'superSampling'
      ],
      settings: {
        vibration: {
          value: 1,
          options: vibrationOptions,
          description: 'Rumble'
        },
        orientation: {
          value: 0,
          options: orientationOptions,
          description: 'Orient.'
        },
        sound: {
          value: true,
          options: undefined,
          description: 'Sound'
        },
        autoScale: {
          value: true,
          options: genericOptions,
          description: 'Auto Scale'
        },
        mobileAssists: {
          value: true,
          options: genericOptions,
          description: 'Mobile Assists'
        },
        superSampling: {
          value: 2,
          options: superSamplingOptions,
          description: 'Super Sampling'
        }
      },
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
  margin-top: calc(0px * var(--global-ss));
  margin-left: calc(8px * var(--global-ss));
  margin-right: calc(7px * var(--global-ss));
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
