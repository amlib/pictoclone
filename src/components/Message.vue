<template>
  <w-plate class="message-area" tile-name="main-drawing-area"
           :notch="[true, true, true, true]"
           :stripe-mode="edit ? 2 : null" :color-hue-deg="colorsCssHueDeg[messagePayload.colorIndex]">
    <w-drawing-canvas v-if="edit" :width="messagePayload.width" :height="messagePayload.height" ref="drawing"
      class="drawing-area" :target-width="targetWidth" :target-height="targetHeight"
      :tool="selectedTool" :brush-size="brushSize" text-font="10px NDS12" :line-height="16"/>
    <div v-else class="drawing-area drawing-area-show pixel-rendering" :style="getViewStyle"/>
    <w-plate :class="[isMessageOneSegment ? 'fill' : '', 'message-area-user-tag']" tile-name="main-color-background"
             :notch="[true, false, true, isMessageOneSegment]" :color-hue-deg="colorsCssHueDeg[messagePayload.colorIndex]">
      <div class="global-color-hue-tint">{{ messagePayload.user }}</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WDrawingCanvas from '@/widgets/DrawingCanvas'
import { defaultTextX, defaultTextY, messageVerticalSegmentSize } from '@/js/Message'
import { colorsCssHueDeg } from '@/js/Colors'

export default {
  name: 'Message',
  components: { WDrawingCanvas, WPlate },
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
      backspace: () => this.keyPressBackspace(),
      space: () => this.keyPress(' '),
      shift: () => {},
      caps: () => {}
    }

    this.colorsCssHueDeg = colorsCssHueDeg
    this.defaultTextX = defaultTextX
    this.defaultTextY = defaultTextY
    this.specialKeys = specialKeys
  },
  mounted: function () {
    if (this.edit) {
      this.$refs.drawing.textBufferSetStart(this.defaultTextX, this.defaultTextY)
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
        this.$refs.drawing.textBufferAppend(key)
      }
    },
    keyPressEnter: function () {
      if (!this.$refs.drawing) { return }
      this.$refs.drawing.textBufferLinebreak()
    },
    keyPressBackspace: function () {
      if (!this.$refs.drawing) { return }
      this.$refs.drawing.textBufferBackspace()
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
        this.$refs.drawing.textBufferMerge()
        this.$refs.drawing.textBufferSetStart(
          Math.round((targetX - canvasPos.left) * canvasPos.widthProportion) - 3,
          Math.round((targetY - canvasPos.top) * canvasPos.heightProportion) + 5
        )
        this.$refs.drawing.textBufferAppend(payload.symbol)
      } else {
        // this.$emit('symbol-drop-rejected')
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
