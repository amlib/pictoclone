<template>
  <w-plate class="toggle-switch" tile-name="thin-frame" :padding="2" :style="toggleStyle">
    <div class="toggle-switch-description-wrapper">
      <div class="toggle-switch-description">
        <slot></slot>
      </div>
    </div>
    <div class="toggle-switch-button-wrapper">
      <template v-for="(option, index) in options" :key="index">
        <div :class="['options-text', index === selectedIndex ? 'text-selected' : (option.recommended ? 'text-recommended' : '')]">
          {{ option.description }}
        </div>
      </template>
      <w-button class="toggle-switch-button" :plate-padding="2" expand-plate :style="getButtonStyle"
                normal-tile="beveled-button" active-tile="beveled-button-highlight"
                @click="toggle" global-tint>
      </w-button>
    </div>
  </w-plate>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'
import WButton from '/src/widgets/Button.vue'
import { watch } from 'vue'

const defaultOptions = function () {
  return [
    {
      description: 'ON',
      value: true
    },
    {
      description: 'OFF',
      value: false
    }
  ]
}

export default {
  name: 'WToggleSwitch',
  components: { WButton, WPlate },
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      required: false,
      default: null
    },
    options: {
      type: Array,
      required: false,
      default: defaultOptions()
    },
    buttonSize: {
      type: Number,
      required: false,
      default: 15
    }
  },
  data: function () {
    return {
      selectedIndex: 0
    }
  },
  computed: {
    toggleStyle: function () {
      return {
        '--switch-button-size': this.buttonSize
      }
    },
    getButtonStyle: function () {
      const obj = {}
      obj.top = (this.selectedIndex * this.buttonSize * this.$global.superSample) + 'px'
      return obj
    }
  },
  mounted: function () {
    watch(() => this.modelValue, (newVal) => {
      this.selectedIndex = this.options.findIndex(o => o.value === newVal)
    }, { immediate: true })
  },
  methods: {
    toggle: function () {
      this.$global.audio.playProgram('pc-click')
      this.selectedIndex += 1
      if (this.selectedIndex > (this.options.length - 1)) {
        this.selectedIndex = 0
      }

      this.$emit('update:modelValue', this.options[this.selectedIndex].value)
    }
  }
}
</script>

<style scoped>
.toggle-switch {
  display: flex;
  flex-direction: row;
}

.toggle-switch-description-wrapper {
  background: linear-gradient(0deg, rgba(251,251,251,1) 0%, rgba(211,211,211,1) 80%, rgba(195,195,195,1) 100%);
  border-right: calc(2px * var(--global-ss)) solid #aaaaaa;
  padding: calc(2px * var(--global-ss));
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
  flex: 1 1 auto;
}

.toggle-switch-button-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toggle-switch-description {
  flex-basis: 0;
  text-align: center;
}

.toggle-switch-button {
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  height: calc(1px * var(--switch-button-size) * var(--global-ss));
  transition: top 0.1s linear;
}

.options-text {
  padding: calc(2px * var(--global-ss))  calc(4px * var(--global-ss));
  height: calc(1px * (var(--switch-button-size) - 4) * var(--global-ss));
  text-align: center;
  user-select: none;
  pointer-events: none;
  line-height: calc(10px * var(--global-ss));
  z-index: 2;
  transition: opacity 0.7s ease;
  opacity: 0.6;
}

.text-selected {
  opacity: 1.0;
  color: var(--global-cl2);
  position: relative;
  text-shadow: 0 calc(-0.5px * var(--global-ss)) 0 black,
    calc(-0.5px * var(--global-ss)) calc(-0.5px * var(--global-ss)) 0 black,
    0 calc(0.5px * var(--global-ss)) 0 rgba(255,255,255,.4);
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
