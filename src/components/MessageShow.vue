<template>
  <w-plate class="message-area" tile-name="main-drawing-area"
           :notch="[true, true, true, true]"
           :stripe-mode="stripe"
           :color-hue-deg="colorsCssHueDeg[colorsHex[messagePayload.colorIndex]]">
    <slot/>
    <div v-if="!noDrawing" class="drawing-area drawing-area-show pixel-rendering" :style="getViewStyle"/>
    <w-plate :class="[isMessageOneSegment ? 'fill' : '', 'message-area-user-tag']"
             tile-name="main-color-background"
             :notch="[true, false, true, isMessageOneSegment]"
             :color-hue-deg="colorsCssHueDeg[colorsHex[messagePayload.colorIndex]]"
             ref="user-tag">
      <div :style="{ color: colorsHexDarker[messagePayload.colorIndex] }">{{ messagePayload.user }}</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'
import { messageVerticalSegmentSize } from '/src/js/Message'
import { colorsCssHueDeg, colorsHex, colorsHexDarker } from '/src/js/Colors'

export default {
  name: 'MessageShow',
  components: { WPlate },
  props: {
    messagePayload: {
      type: Object,
      required: false,
      default: () => {}
    },
    noDrawing: {
      type: Boolean,
      required: false,
      default: false
    },
    stripe: {
      type: Number,
      required: false,
      default: null
    }
  },
  created () {
    this.colorsCssHueDeg = colorsCssHueDeg
    this.colorsHex = colorsHex
    this.colorsHexDarker = colorsHexDarker
  },
  computed: {
    isMessageOneSegment: function () {
      return this.messagePayload.height <= messageVerticalSegmentSize
    },
    getViewStyle: function () {
      return {
        width: `calc(${this.messagePayload.width}px * var(--global-ss))`,
        height: `calc(${this.messagePayload.height}px * var(--global-ss))`,
        backgroundImage: `url(${this.messagePayload.url})`
      }
    }
  },
  methods: {
    getUserTagSize: function () {
      const el = this.$refs['user-tag'].$el
      return {
        width: el.offsetWidth,
        height: el.offsetHeight
      }
    }
  }
}
</script>

<style scoped>
.message-area {
  margin-top: calc(1px * var(--global-ss));
  margin-bottom: calc(1px * var(--global-ss));
  position: relative;
  display: block;
  max-width: min-content;
}

.message-area-user-tag {
  user-select: none;
  position: absolute;
  left: 0;
  top: 0;
  min-width: calc(32px * var(--global-ss));
  max-width: calc(86px * var(--global-ss));
  color: red;
}

.fill {
  bottom: 0;
}

.message-area-user-tag > div {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.drawing-area {
  margin-top: calc(-1px * var(--global-ss));
  margin-bottom: calc(-2px * var(--global-ss));
  margin-left: calc(-1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  background-size: contain;
}

.drawing-area-show {
  margin-bottom: calc(-1px * var(--global-ss));
}
</style>
