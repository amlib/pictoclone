<template>
  <w-plate class="message-area" tile-name="main-drawing-area"
           :notch="[true, true, true, true]"
           :stripe-mode="edit ? 2 : null" :color-hue-deg="colorsCssHueDeg[colorsHex[messagePayload.colorIndex]]">
    <w-drawing-canvas v-if="edit" :width="messagePayload.width" :height="messagePayload.height" ref="drawing"
      class="drawing-area" :target-width="targetWidth" :target-height="targetHeight" :rainbow-brush="rainbowBrush"
      :tool="selectedTool" :brush-size="brushSize" text-font="10px NDS12" :line-height="16"
      @stroke-start="strokeStart" @stroke-move="strokeMove" @stroke-end="strokeEnd"/>
    <div v-else class="drawing-area drawing-area-show pixel-rendering" :style="getViewStyle"/>
    <w-plate :class="[isMessageOneSegment ? 'fill' : '', 'message-area-user-tag']" tile-name="main-color-background"
             :notch="[true, false, true, isMessageOneSegment]" :color-hue-deg="colorsCssHueDeg[colorsHex[messagePayload.colorIndex]]">
      <div :style="{ color: colorsHexDarker[messagePayload.colorIndex] }">{{ messagePayload.user }}</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'
import WDrawingCanvas from '/src/widgets/DrawingCanvas.vue'
import { defaultTextX, defaultTextY, messageVerticalSegmentSize } from '/src/js/Message'
import { colorsCssHueDeg, colorsHex, colorsHexDarker } from '/src/js/Colors'

export default {
  name: 'Message',
  components: { WDrawingCanvas, WPlate },
  emits: ['fun'],
  props: {
    selectedTool: {
      type: String,
      required: false,
      default: null
    },
    brushSize: {
      type: Number,
      required: false,
      default: null
    },
    messagePayload: {
      type: Object,
      required: false,
      default: () => {}
    },
    edit: {
      type: Boolean,
      required: false,
      default: false
    },
    rainbowBrush: {
      type: Boolean,
      required: false,
      defaults: false
    }
  },
  data: function () {
    return {
      messageVerticalSegmentSize
    }
  },
  created () {
    const specialKeys = {
      enter: () => this.keyPressEnter(),
      'small-enter': () => this.keyPressEnter(),
      backspace: () => this.keyPressBackspace(),
      'small-backspace': () => this.keyPressBackspace(),
      space: () => this.keyPress(' '),
      'small-space': () => this.keyPress(' '),
      shift: () => {},
      caps: () => {},
      hiragana: () => {},
      katakana: () => {},
      komoji: () => {}
    }

    this.colorsCssHueDeg = colorsCssHueDeg
    this.colorsHex = colorsHex
    this.colorsHexDarker = colorsHexDarker
    this.defaultTextX = defaultTextX
    this.defaultTextY = defaultTextY
    this.specialKeys = specialKeys
    this.secretMessage = 'you want fun?'
    this.secretMessageCheckIndex = 0
    this.controlAudioProgram = undefined
  },
  mounted: function () {
    if (this.edit) {
      this.$refs.drawing.textBufferSetStart(this.defaultTextX, this.defaultTextY)
    }
  },
  beforeUnmount () {
    if (this.rainbowBrush) {
      this.$global.setRgbMode(false)
    }
  },
  computed: {
    isMessageOneSegment: function () {
      return this.messagePayload.height <= messageVerticalSegmentSize
    },
    targetWidth: function () {
      return this.messagePayload.width * this.$global.superSample
    },
    targetHeight: function () {
      return this.messagePayload.height * this.$global.superSample
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
    clearDrawing: function () {
      if (!this.$refs.drawing) { return }

      this.$refs.drawing.clear()
      this.$refs.drawing.textBufferSetStart(this.defaultTextX, this.defaultTextY)
    },
    textMerge: function () {
      this.$refs.drawing.textBufferMerge()
      this.$refs.drawing.textBufferSetStart(this.defaultTextX, this.defaultTextY)
    },
    getMessage: async function () {
      this.textMerge()
      const imageBounds = this.$refs.drawing.getImageBounds()

      if (imageBounds.boundsTop === imageBounds.boundsBottom) {
        throw new Error('empty')
      }

      // round cropping to segments
      imageBounds.boundsTop = Math.floor(imageBounds.boundsTop / this.messageVerticalSegmentSize) * this.messageVerticalSegmentSize
      imageBounds.boundsBottom = Math.ceil((imageBounds.boundsBottom + 1) / this.messageVerticalSegmentSize) * this.messageVerticalSegmentSize
      imageBounds.boundsLeft = 0
      imageBounds.boundsRight = imageBounds.imageWidth

      // avoids cropped image from being obstructed by user tag
      if (imageBounds.boundsTop >= this.messageVerticalSegmentSize) {
        imageBounds.boundsTop = imageBounds.boundsTop - this.messageVerticalSegmentSize
      }

      const imagePayload = await this.$refs.drawing.getImage({
        top: imageBounds.boundsTop,
        bottom: imageBounds.boundsBottom,
        left: imageBounds.boundsLeft,
        right: imageBounds.boundsRight
      })

      return {
        ...this.messagePayload,
        ...imagePayload
      }
    },
    pasteFromMessage: function (message) {
      this.$refs.drawing.clear()
      this.$refs.drawing.drawFromImageUrl(message.url)
    },
    keyPress: function (key) {
      if (!this.$refs.drawing) { return }

      if (this.specialKeys[key]) {
        this.specialKeys[key](key)
      } else {
        this.secretMessageCheck(key)
        this.$refs.drawing.textBufferAppend(key)
      }
    },
    swapChar: function (key) {
      this.$refs.drawing.textBufferSwapChar(key)
    },
    keyPressEnter: function () {
      if (!this.$refs.drawing) { return }
      this.$refs.drawing.textBufferLinebreak()
    },
    keyPressBackspace: function () {
      if (!this.$refs.drawing) { return }
      this.$refs.drawing.textBufferBackspace()
    },
    secretMessageCheck: function (key) {
      if (this.rainbowBrush) {
        return
      }

      if (key === this.secretMessage[this.secretMessageCheckIndex]) {
        this.secretMessageCheckIndex += 1
      } else {
        if (key === this.secretMessage[0]) {
          this.secretMessageCheckIndex = 1
        } else {
          this.secretMessageCheckIndex = 0
        }
      }

      if (this.secretMessageCheckIndex >= this.secretMessage.length) {
        this.$emit('fun')
      }
    },
    symbolDrop: function (payload) {
      if (!this.$refs.drawing) { return }
      const canvasPos = this.$refs.drawing.getCanvasGlobalPosition()

      const targetX = payload.event.pageX
      const targetY = payload.event.pageY

      if (targetX > canvasPos.left &&
        targetX < (canvasPos.right - 5) &&
        targetY > canvasPos.top &&
        targetY < (canvasPos.bottom - 12)) {
        this.$global.audio.playProgram('pc-symboldrop')
        this.$refs.drawing.textBufferMerge()
        this.$refs.drawing.textBufferSetStart(
          Math.round((targetX - canvasPos.left) * canvasPos.widthProportion) - 3,
          Math.round((targetY - canvasPos.top) * canvasPos.heightProportion) + 5
        )
        this.$refs.drawing.textBufferAppend(payload.symbol)
      } else {
        // this.$emit('symbol-drop-rejected')
      }
    },
    strokeStart: function (tool) {
      if (!this.controlAudioProgram) {
        this.controlAudioProgram = this.$global.audio.startComplexProgram(tool === 'eraser' ? 'pc-eraser-cp' : 'pc-pen-cp')
      }
    },
    strokeMove: function (dist) {
      if (this.controlAudioProgram) {
        this.controlAudioProgram.modify(dist, 0.3)
      }
    },
    strokeEnd: function () {
      if (this.controlAudioProgram) {
        this.controlAudioProgram.stop()
        this.controlAudioProgram = undefined
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
  width: calc(61px * var(--global-ss));
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
