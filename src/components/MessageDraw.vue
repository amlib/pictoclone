<template>
  <message-show :message-payload="messagePayload" :no-drawing="true" :stripe="2" ref="message">
    <w-drawing-canvas :width="messagePayload.width" :height="messagePayload.height" ref="drawing"
                      class="drawing-area" :target-width="targetWidth" :target-height="targetHeight" :rainbow-brush="rainbowBrush"
                      :tool="selectedTool" :brush-size="brushSize" text-font="10px NDS12" :line-height="16"
                      @stroke-start="strokeStart" @stroke-move="strokeMove" @stroke-end="strokeEnd"/>
  </message-show>
</template>

<script>
import WDrawingCanvas from '/src/widgets/DrawingCanvas.vue'
import MessageShow from './MessageShow.vue'
import { defaultTextX, defaultTextY, messageVerticalSegmentSize } from '/src/js/Message'

export default {
  name: 'MessageDraw',
  components: { MessageShow, WDrawingCanvas },
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
    rainbowBrush: {
      type: Boolean,
      required: false,
      defaults: false
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

    this.defaultTextX = defaultTextX
    this.defaultTextY = defaultTextY
    this.specialKeys = specialKeys
    this.secretMessage = 'i want fun'
    this.secretMessageCheckIndex = 0
    this.controlAudioProgram = undefined
  },
  mounted: function () {
    // get user tag size so that the text buffer can start at the proper position
    //also chrome would not return the proper size immediately, hence the timeout... (thanks google)
    setTimeout(() => {
      this.defaultTextX = this.$refs['message'].getUserTagSize().width / this.$global.superSample
      this.$refs.drawing.textBufferSetStart(this.defaultTextX, this.defaultTextY)
    }, 66)
  },
  beforeUnmount () {
    if (this.rainbowBrush) {
      this.$global.setRgbMode(false)
    }
  },
  computed: {
    targetWidth: function () {
      return this.messagePayload.width * this.$global.superSample
    },
    targetHeight: function () {
      return this.messagePayload.height * this.$global.superSample
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
      imageBounds.boundsTop = Math.floor(imageBounds.boundsTop / messageVerticalSegmentSize) * messageVerticalSegmentSize
      imageBounds.boundsBottom = Math.ceil((imageBounds.boundsBottom + 1) / messageVerticalSegmentSize) * messageVerticalSegmentSize
      imageBounds.boundsLeft = 0
      imageBounds.boundsRight = imageBounds.imageWidth

      // avoids cropped image from being obstructed by user tag
      if (imageBounds.boundsTop >= messageVerticalSegmentSize) {
        imageBounds.boundsTop = imageBounds.boundsTop - messageVerticalSegmentSize
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
.drawing-area {
  margin-top: calc(-1px * var(--global-ss));
  margin-bottom: calc(-2px * var(--global-ss));
  margin-left: calc(-1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  background-size: contain;
}
</style>
