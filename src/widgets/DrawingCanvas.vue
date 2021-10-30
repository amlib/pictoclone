<template>
  <div class="canvas-wrapper" v-bind="$attrs">
    <canvas ref="canvas-buffer" :width="width" :height="height" class="canvas canvas-buffer pixel-rendering" :style="canvasStyle"/>
    <canvas ref="canvas" :width="width" :height="height" class="canvas pixel-rendering" :style="canvasStyle"
            @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerCancel"/>
  </div>
</template>

<script>
import { getCanvasBlob } from '@/js/Utils'

const brushType = 'brush-normal'
const brushes = [
  'brush-normal-1px',
  'brush-normal-2px'
]

export default {
  name: 'WDrawingCanvas',
  emits: ['text-buffer-line-break-aborted'],
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    targetWidth: {
      type: Number,
      required: true
    },
    targetHeight: {
      type: Number,
      required: true
    },
    tool: {
      type: String,
      required: false,
      default: 'eraser'
    },
    brushSize: {
      type: Number,
      required: false,
      default: 2
    },
    toolColor: {
      type: String,
      required: false,
      default: '#000'
    },
    textFont: {
      type: String,
      required: false,
      default: null
    },
    lineHeight: {
      type: Number,
      required: false,
      default: 10
    },
    newLineXOffset: {
      type: Number,
      required: false,
      default: 4
    }
  },
  data: function () {
    return {
      beginPosition: { x: 0, y: 0 },
      brushType: brushType,
      brushes: brushes,
      textBuffer: []
    }
  },
  computed: {
    brush: function () {
      return this.brushType + '-' + this.brushSize + 'px'
    },
    canvasStyle: function () {
      return {
        width: this.targetWidth + 'px',
        height: this.targetHeight + 'px'
      }
    },
    brushesImages: function () {
      const images = {}
      this.brushes.forEach(brush => {
        // TODO investigate weather this will leak elements... should we remove them?
        const image = new Image()
        image.src = this.$tileMap(brush).url
        images[brush] = image
      })

      return images
    },
    textBufferLastLine: {
      get: function () {
        return this.textBuffer[this.textBuffer.length - 1]
      },
      set: function (newVal) {
        this.textBuffer[this.textBuffer.length - 1] += newVal
      }
    },
    textBufferLastLineY: function () {
      return this.textY + (this.lineHeight * (this.textBuffer.length - 1))
    }
  },
  created: function () {
    this.painting = false
    this.stroking = false
    this.textBufferLineOffsets = []
    this.textX = 0
    this.textY = 0
  },
  mounted: function () {
    this.canvasContext = this.$refs.canvas.getContext('2d')
    this.canvasBufferContext = this.$refs['canvas-buffer'].getContext('2d')
    this.canvasBufferContext.font = this.textFont
    this.textBufferClear()
  },
  methods: {
    pointerDown: function (event) {
      if (event.buttons & 1) {
        this.$refs.canvas.setPointerCapture(event.pointerId)
        this.startStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
      }
    },
    pointerMove: function (event) {
      this.moveStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
    },
    pointerUp: function (event) {
      this.$refs.canvas.releasePointerCapture(event.pointerId)
      this.endStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
    },
    pointerCancel: function (event) {
      this.$refs.canvas.releasePointerCapture(event.pointerId)
      this.endStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
    },
    startStroke: function (x, y) {
      this.painting = true
      this.stroking = false
      this.canvasContext.lineWidth = this.brushSize

      if (this.tool === 'eraser') {
        // WARNING: assuming blank canvas is white and alpha is zero
        this.canvasContext.strokeStyle = '#fff'
        this.canvasContext.globalCompositeOperation = 'destination-out'
      } else {
        this.canvasContext.strokeStyle = this.toolColor
        this.canvasContext.globalCompositeOperation = 'source-over'
      }

      this.beginPosition = { x: Math.round(x), y: Math.round(y) }
    },
    moveStroke: function (x, y) {
      if (this.painting) {
        this.stroking = true
        const destPosition = { x: Math.round(x), y: Math.round(y) }
        const dist = Math.min(this.distanceBetween(this.beginPosition, destPosition), 100)
        const angle = this.angleBetween(this.beginPosition, destPosition)
        const halfSizeOfBrush = Math.floor(this.brushSize / 2)

        const target = this.brushSize >= 2 ? Math.floor(dist) : Math.ceil(dist)
        for (let i = 0; i < target; i++) {
          const x = this.beginPosition.x + (Math.sin(angle) * i) - halfSizeOfBrush
          const y = this.beginPosition.y + (Math.cos(angle) * i) - halfSizeOfBrush
          this.canvasContext.drawImage(this.brushesImages[this.brush], Math.round(x), Math.round(y))
        }

        this.beginPosition = destPosition
      }
    },
    endStroke: function (x, y) {
      if (!this.stroking) {
        this.canvasContext.drawImage(this.brushesImages[this.brush], this.beginPosition.x, this.beginPosition.y)
      }
      this.painting = false
      this.stroking = false
    },
    distanceBetween: function (point1, point2) {
      return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
    },
    angleBetween: function (point1, point2) {
      return Math.atan2(point2.x - point1.x, point2.y - point1.y)
    },
    clear: function () {
      // TODO this fills the canvas with rgba(0,0,0,0) transparent black, may cause problems when saving/sending picture
      // TODO investigate canvas initial state (is it also transparent black?)
      this.canvasContext.clearRect(0, 0, this.width, this.height)
      this.textBufferClear()
    },
    elementOffset: function (el) {
      const rect = el.getBoundingClientRect()
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        right: rect.right + scrollLeft,
        bottom: rect.bottom + scrollTop
      }
    },
    getCanvasGlobalPosition: function () {
      const elementOffset = this.elementOffset(this.$refs.canvas)
      const realWidth = elementOffset.right - elementOffset.left
      const realHeight = elementOffset.bottom - elementOffset.top

      return {
        ...elementOffset,
        widthProportion: this.width / realWidth,
        heightProportion: this.height / realHeight
      }
    },
    textBufferSetStart: function (x, y) {
      this.textX = x
      this.textY = y
    },
    textBufferClear: function () {
      this.canvasBufferContext.clearRect(0, 0, this.width, this.height)
      this.textBuffer = []
      this.textBufferLineOffsets = []
    },
    textBufferLinebreak: function () {
      if ((this.textBufferLastLineY + this.lineHeight) > this.height) {
        this.$emit('text-buffer-line-break-aborted')
        return false
      }
      this.textBuffer.push('')
      this.textBufferLineOffsets.push(this.newLineXOffset)
      // this.redrawTextBuffer()
      return true
    },
    textBufferBackspace: function () {
      const newString = this.textBufferLastLine.substring(0, this.textBufferLastLine.length - 1)

      if (newString == null || newString === '') {
        this.textBuffer.pop()
      } else {
        this.textBuffer[this.textBuffer.length - 1] = newString
      }

      this.redrawTextBuffer()
    },
    textBufferAppend: function (text) {
      if (this.textBuffer.length <= 0) {
        this.textBuffer.push('')
        this.textBufferLineOffsets.push(this.textX)
      }

      const textMetrics = this.canvasBufferContext.measureText(this.textBufferLastLine + text)
      const totalWidth = this.textBufferLineOffsets[this.textBufferLineOffsets.length - 1] + Math.round(textMetrics.width)
      if (totalWidth >= this.width) {
        if (!this.textBufferLinebreak()) {
          return
        }
      }

      this.textBufferLastLine = text // computed will append
      this.redrawTextBuffer()
    },
    redrawTextBuffer: function () {
      this.canvasBufferContext.clearRect(0, 0, this.width, this.height)

      let y = this.textY
      for (let i = 0; i < this.textBuffer.length; ++i) {
        const line = this.textBuffer[i]
        const x = this.textBufferLineOffsets[i]
        this.canvasBufferContext.fillText(line, x, y)
        y += this.lineHeight
      }
    },
    textBufferMerge: function () {
      this.canvasContext.globalCompositeOperation = 'source-over'
      this.canvasContext.drawImage(this.$refs['canvas-buffer'], 0, 0)
      this.textBufferClear()
    },
    getImageBounds: function () {
      const imageData = this.canvasContext.getImageData(0, 0, this.width, this.height)
      const { data, height, width } = imageData

      let lineOffset
      let boundsTop = height
      let boundsBottom = 0
      let boundsLeft = width
      let boundsRight = 0

      for (let iy = 0; iy < height; ++iy) {
        for (let ix = 0; ix < width; ++ix) {
          lineOffset = (iy * width * 4) + (ix * 4)
          if (data[lineOffset + 3]) { // only checks alpha
            boundsTop = iy < boundsTop ? iy : boundsTop
            boundsBottom = iy > boundsBottom ? iy : boundsBottom
            boundsLeft = ix < boundsLeft ? ix : boundsLeft
            boundsRight = ix > boundsRight ? ix : boundsRight
          }
        }
      }

      boundsTop = boundsTop < boundsBottom ? boundsTop : 0
      boundsBottom = boundsBottom > boundsTop ? boundsBottom : 0
      boundsLeft = boundsLeft < boundsRight ? boundsLeft : 0
      boundsRight = boundsRight < boundsLeft ? boundsRight : 0

      return {
        boundsTop,
        boundsBottom,
        boundsLeft,
        boundsRight,
        boundsWidth: boundsRight - boundsLeft,
        boundsHeight: boundsBottom - boundsTop,
        imageWidth: width,
        imageHeight: height
      }
    },
    getImage: async function (crop) {
      const imageData = {}
      let canvasTarget

      if (crop) {
        const cropCanvas = document.createElement('canvas')

        if (cropCanvas.getContext) {
          const context = cropCanvas.getContext('2d')
          const cropWidth = crop.right - crop.left
          const cropHeight = crop.bottom - crop.top
          cropCanvas.width = cropWidth
          cropCanvas.height = cropHeight
          context.globalCompositeOperation = 'copy'
          context.imageSmoothingEnabled = false

          context.drawImage(this.$refs.canvas, crop.left, crop.top, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight)

          canvasTarget = cropCanvas
          imageData.width = cropWidth
          imageData.height = cropHeight
        } else {
          throw new Error('Could not create canvas for cropping')
        }
      } else {
        canvasTarget = this.$refs.canvas
        imageData.width = this.width
        imageData.height = this.height
      }

      const blob = await getCanvasBlob(canvasTarget)

      if (crop) {
        canvasTarget.remove()
      }

      return {
        url: URL.createObjectURL(blob), // TODO revoke!!!
        ...imageData
      }
    },
    drawFromImageUrl: function (imageUrl) {
      // TODO could return a promise
      const image = new Image()
      image.src = imageUrl
      image.onload = () => {
        this.canvasContext.drawImage(image, 0, 0)
      }
    }
  }
}
</script>

<style scoped>
.canvas-wrapper {
  line-height: 0;
  display: block;
  position: relative;
}

.canvas {
  touch-action: none; /* will keep screen from zooming or panning when touching in mobile */
}

.canvas-buffer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.brush-image {
  display: none;
  position: absolute;
  line-height: 0;
}
</style>
