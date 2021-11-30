<template>
  <teleport to="#modal-teleport-target">
    <div :class="['modal-container', !show && 'hide']">
      <w-plate tile-name="modal-dialog" tile-mode :padding="padding"
              :class="['modal-plate', !show && 'hide-plate']"
              :style="plateStyle">
        <div ref="slot-wrapper" class="slot-wrapper">
          <slot></slot>
        </div>
      </w-plate>
    </div>
  </teleport>
</template>

<script>
import WPlate from '../widgets/Plate.vue'
export default {
  name: 'ModalDialog',
  components: { WPlate },
  props: {
    padding: {
      type: Number,
      default: 8
    },
    show: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data: function () {
    return {
      plateViewHeight: 0
    }
  },
  computed: {
    plateStyle: function () {
      const obj = {}

      const base = 6
      const segments = 2 * Math.floor(this.plateViewHeight / this.$global.superSample / base / 2 ) + 1
      const size = segments * base * this.$global.superSample
      obj.height = `${size}px`

      return obj
    }
  },
  mounted: function () {
    this.onResizeThrottled = () => requestAnimationFrame(() => { this.onResize() })
    this.slotWrapper = new ResizeObserver(this.onResizeThrottled).observe(this.$refs['slot-wrapper'])
  },
  beforeUnmount: function () {
    if (this.slotWrapper) {
      this.slotWrapper.unobserve(this.$refs['slot-wrapper'])
    }
  },
  methods: {
    onResize: function () {
      if (this.$refs['slot-wrapper']) {
        this.plateViewHeight = this.$refs['slot-wrapper'].offsetHeight
      }
    }
  }
}
</script>

<style scoped>
.modal-container {
  height: 100%;
  background-color: rgba(0,0,0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
  pointer-events: all;
  transition: opacity 0.2s linear;
}

.hide {
  opacity: 0;
  touch-action: none;
  pointer-events: none;
}

.modal-plate {
  min-width: calc(64px * var(--global-ss));
  max-width: 75%;
  max-height: 90%;
  transition: transform 0.2s linear;
}

.hide-plate {
  transform: translateY(100%);
}

.slot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
