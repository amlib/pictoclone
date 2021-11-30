<template>
  <div class="canvas-wrapper" v-bind="$attrs">
    <canvas ref="canvas-buffer2" :width="width" :height="height" class="canvas canvas-buffer2 pixel-rendering" :style="canvasStyle"/>
    <canvas ref="canvas-buffer" :width="width" :height="height" class="canvas canvas-buffer pixel-rendering" :style="canvasStyle"/>
    <canvas ref="canvas" :width="width" :height="height" class="canvas pixel-rendering" :style="canvasStyle"
            @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerCancel"/>
  </div>
</template>

<script>
import { getCanvasBlob, hexToRgb } from '/src/js/Utils'
import { rainbowBrushColors } from '/src/js/Colors'

const brushType = 'brush-normal'
const brushes = [
  'brush-normal-1px',
  'brush-normal-2px',
  'brush-normal-5px'
]

export default {
  name: 'WDrawingCanvas',
  emits: ['text-buffer-line-break-aborted', 'stroke-start', 'stroke-move', 'stroke-end', 'flood-start', 'flood-move', 'flood-end'],
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
    },
    rainbowBrush: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      beginPosition: { x: 0, y: 0 },
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
    this.brushType = brushType
    this.brushes = brushes
    this.rainbowBrushColors = rainbowBrushColors
    this.rainbowBrushColorIndex = 0
    this.painting = false
    this.stroking = false
    this.textBufferLineOffsets = []
    this.textX = 0
    this.textY = 0
    this.brushesImages = this.generateBrushesImages()
  },
  mounted: function () {
    this.canvasContext = this.$refs.canvas.getContext('2d')
    this.canvasBufferContext = this.$refs['canvas-buffer'].getContext('2d')
    this.canvasBufferContext.font = this.textFont
    this.canvasBuffer2Context = this.$refs['canvas-buffer2'].getContext('2d')
    this.textBufferClear()
  },
  methods: {
    pointerDown: function (event) {
      if (event.buttons & 1) {
        this.$refs.canvas.setPointerCapture(event.pointerId)
        if (this.tool === 'flood') {
          this.floodFill(Math.round(event.offsetX / this.$global.superSample), Math.round(event.offsetY / this.$global.superSample))
        } else {
          this.startStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
        }
      }
    },
    pointerMove: function (event) {
      this.moveStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
    },
    pointerUp: function (event) {
      this.$refs.canvas.releasePointerCapture(event.pointerId)
      if (this.tool !== 'flood') {
        this.endStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
      }
      if (this.controlAudioProgram) {
        this.controlAudioProgram.stop()
        this.controlAudioProgram = undefined
      }
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
        this.canvasContext.globalCompositeOperation = 'destination-out'
      } else {
        // this.canvasContext.strokeStyle = this.toolColor // color does not actually works with current drawImage brush technique....
        this.canvasContext.globalCompositeOperation = 'source-over'
      }

      this.strokePreviousTimestamp = undefined
      this.beginPosition = { x: Math.round(x), y: Math.round(y) }
      this.$emit('stroke-start', this.tool)
    },
    moveStroke: function (x, y) {
      if (this.painting) {
        requestAnimationFrame((timestamp) => {
          if (this.painting && (this.strokePreviousTimestamp == null || timestamp - this.strokePreviousTimestamp > 16)) {
            this.stroking = true

            const destPosition = {
              x: Math.round(x),
              y: Math.round(y)
            }
            const dist = Math.min(this.distanceBetween(this.beginPosition, destPosition), 100)
            const angle = this.angleBetween(this.beginPosition, destPosition)
            const halfSizeOfBrush = Math.floor(this.brushSize / 2)

            const target = this.brushSize >= 2 ? Math.floor(dist) : Math.ceil(dist)

            let canvasTarget
            if (this.rainbowBrush) {
              this.rainbowBrushColorIndex += 1
              if (this.rainbowBrushColorIndex > this.rainbowBrushColors.length - 1) {
                this.rainbowBrushColorIndex = 0
              }

              this.canvasBuffer2Context.globalCompositeOperation = 'source-over'
              this.canvasBuffer2Context.clearRect(0, 0, this.width, this.height)
              canvasTarget = this.canvasBuffer2Context
            } else {
              canvasTarget = this.canvasContext
            }

            for (let i = 0; i < target; i++) {
              const x = this.beginPosition.x + (Math.sin(angle) * i) - halfSizeOfBrush
              const y = this.beginPosition.y + (Math.cos(angle) * i) - halfSizeOfBrush
              canvasTarget.drawImage(this.brushesImages[this.brush], Math.round(x), Math.round(y))
            }

            if (this.rainbowBrush) {
              this.canvasBuffer2Context.globalCompositeOperation = 'source-in'
              this.canvasBuffer2Context.fillStyle = this.rainbowBrushColors[this.rainbowBrushColorIndex]
              this.canvasBuffer2Context.fillRect(0, 0, this.width, this.height)
              this.canvasContext.drawImage(this.$refs['canvas-buffer2'], 0, 0)
            }

            this.beginPosition = destPosition
            this.$emit('stroke-move', dist)
            this.strokePreviousTimestamp = timestamp
          }
        })
      }
    },
    endStroke: function (x, y) {
      if (!this.stroking) {
        this.canvasContext.drawImage(this.brushesImages[this.brush], this.beginPosition.x, this.beginPosition.y)
      } else {
        if (this.rainbowBrush) {
          this.canvasBuffer2Context.clearRect(0, 0, this.width, this.height)
        }
      }

      this.$emit('stroke-end')
      this.painting = false
      this.stroking = false
    },
    floodFill: async function (x, y) {
      if (this.flooding) {
        return
      }

      this.flooding = true
      this.$emit('flood-start')
      const imageData = this.canvasContext.getImageData(0, 0, this.width, this.height)

      this.rainbowBrushColorIndex = Math.round((this.rainbowBrushColors.length - 1) * Math.random())
      let colorR = 0
      let colorG = 0
      let colorB = 0
      if (this.rainbowBrush) {
        const rgb = hexToRgb(this.rainbowBrushColors[this.rainbowBrushColorIndex])
        colorR = rgb.r
        colorG = rgb.g
        colorB = rgb.b
      }

      const { data, height, width } = imageData
      const dataOffset = (y * width * 4) + (x * 4)
      data[dataOffset] = colorR
      data[dataOffset + 1] = colorG
      data[dataOffset + 2] = colorB
      data[dataOffset + 3] = 255

      await this.interactiveFloodFill(imageData, x, y, colorR, colorG, colorB)
      this.$emit('flood-end')
      this.flooding = false
    },
    imageDataComparePixels(imageData, x1, y1, x2, y2) {
      const { data, height, width } = imageData

      if (y1 < 0 || y1 > (height -1) || y2 < 0 || y2 > (height - 1) ||
        x1 < 0 || x1 > (width -1) || x2 < 0 || x2 > (width - 1)) {
        return -1
      }

      const dataOffset1 = (y1 * width * 4) + (x1 * 4)
      const p1R = data[dataOffset1]
      const p1G = data[dataOffset1 + 1]
      const p1B = data[dataOffset1 + 2]
      const p1A = data[dataOffset1 + 3]

      const dataOffset2 = (y2 * width * 4) + (x2 * 4)
      const p2R = data[dataOffset2]
      const p2G = data[dataOffset2 + 1]
      const p2B = data[dataOffset2 + 2]
      const p2A = data[dataOffset2 + 3]

      if (p1R === p2R && p1G === p2G && p1B === p2B && p1A === p2A) {
        return dataOffset2
      } else {
        return -1
      }
    },
    imageDataCompareRGBAToPixel(imageData, r1, g1, b1, a1, x, y) {
      const { data, height, width } = imageData

      if (y < 0 || y > (height - 1) ||
        x < 0 || x > (width - 1)) {
        return -1
      }

      const dataOffset2 = (y * width * 4) + (x * 4)
      const pR = data[dataOffset2]
      const pG = data[dataOffset2 + 1]
      const pB = data[dataOffset2 + 2]
      const pA = data[dataOffset2 + 3]

      if (r1 === pR && g1 === pG && b1 === pB && a1 === pA) {
        return dataOffset2
      } else {
        return -1
      }
    },
    floodFillHorizontal: async function (imageData, x, y, depth, left = true, right = true) {
      depth += 1
      if (depth > this.maxDepth) {
        this.maxDepth = depth
      }

      const queueLeft = []
      const queueRight = []
      const { data, height, width } = imageData

      if (left) {
        for (let i = x; i > 0; --i) {
          const matchOffset = this.imageDataCompareRGBAToPixel(imageData, 0, 0, 0, 0, i - 1, y)
          if (matchOffset >= 0) {
            data[matchOffset] = 0
            data[matchOffset + 1] = 0
            data[matchOffset + 2] = 0
            data[matchOffset + 3] = 255

            queueLeft.push(
              i - 1, y + 1,
              i - 1, y - 1
            )
            queueRight.push(
              i - 1, y + 1,
              i - 1, y - 1
            )
          } else {
            break
          }
        }
      }


      if (right) {
        for (let i = x; i < width; ++i) {
          const matchOffset = this.imageDataCompareRGBAToPixel(imageData, 0, 0, 0, 0, i + 1, y)
          if (matchOffset >= 0) {
            data[matchOffset] = 0
            data[matchOffset + 1] = 0
            data[matchOffset + 2] = 0
            data[matchOffset + 3] = 255

            queueLeft.push(
              i + 1, y + 1,
              i + 1, y - 1
            )
            queueRight.push(
              i + 1, y + 1,
              i + 1, y - 1
            )
          } else {
            break
          }
        }
      }


      for (let i = 0; i < queueLeft.length; i += 4) {
        await this.floodFillHorizontal(imageData, queueLeft[i], queueLeft[i + 1], depth, true, false)
        await this.floodFillHorizontal(imageData, queueLeft[i + 2], queueLeft[i + 3], depth, true, false)
      }

      for (let i = 0; i < queueRight.length; i += 4) {
        await this.floodFillHorizontal(imageData, queueLeft[i], queueLeft[i + 1], depth, false, true)
        await this.floodFillHorizontal(imageData, queueLeft[i + 2], queueLeft[i + 3], depth, false, true)
      }

      this.canvasContext.putImageData(imageData, 0, 0)
      await new Promise(requestAnimationFrame)
    },
    interactiveFloodFill: async function (imageData, startX, startY, r, g, b) {
      const { data, height, width } = imageData
      // stack is a pair of y coord and a list of x coords matched/to test
      const stack = [startY, [startX]]

      let previousTimestamp = 0
      let stackLoopCount = 0
      let stackLoopSkip = 2
      let matchedAcc = 0
      let previousMatchedX = 0
      while (stack.length > 0) {
        const matchedX = stack.pop()
        const currentLineY = stack.pop()

        const currentLineMatchedX = []
        for (let i = 0; i < matchedX.length; ++i) {
          let x = matchedX[i]
          let matchOffset
          const currentPixelY = currentLineY

          let currentPixelX = x
          while ((matchOffset = this.imageDataCompareRGBAToPixel(imageData, 0, 0, 0, 0, currentPixelX - 1, currentPixelY))
          && matchOffset >= 0) {
            data[matchOffset] = r
            data[matchOffset + 1] = g
            data[matchOffset + 2] = b
            data[matchOffset + 3] = 255
            currentLineMatchedX.push(currentPixelX)
            currentPixelX -= 1
          }

          currentPixelX = x
          while ((matchOffset = this.imageDataCompareRGBAToPixel(imageData, 0, 0, 0, 0, currentPixelX + 1, currentPixelY))
          && matchOffset >= 0) {
            data[matchOffset] = r
            data[matchOffset + 1] = g
            data[matchOffset + 2] = b
            data[matchOffset + 3] = 255
            currentLineMatchedX.push(currentPixelX)
            currentPixelX += 1
          }
        }

        if (currentLineMatchedX.length > 0) {
          if (currentLineY < (height - 1)) {
            stack.push(currentLineY + 1, currentLineMatchedX)
          }
          if (currentLineY > 0) {
            stack.push(currentLineY - 1, currentLineMatchedX)
          }
        }

        if (stackLoopCount % stackLoopSkip === 0 || stack.length <= 0) {
          this.canvasContext.putImageData(imageData, 0, 0)
          if (stackLoopCount > 1000) {
            stackLoopSkip = 8
          } else if (stackLoopCount > 10000) {
            stackLoopSkip = 64
          } else if (stackLoopCount > 200000) {
            break
          }

          matchedAcc += matchedX.length
          if (this.rainbowBrush && matchedAcc > width * 2) {
            matchedAcc = 0
            const rgb = hexToRgb(this.rainbowBrushColors[this.rainbowBrushColorIndex])
            r = rgb.r
            g = rgb.g
            b = rgb.b
            this.rainbowBrushColorIndex += 1
            if (this.rainbowBrushColorIndex > this.rainbowBrushColors.length - 1) {
              this.rainbowBrushColorIndex = 0
            }
          }

          this.$emit('flood-move', { pixelsFilled: matchedX.length === previousMatchedX ? Math.round(Math.random() * width) : matchedX.length, width: width })
          previousMatchedX = matchedX.length
          do {
            const timestamp = await new Promise(requestAnimationFrame)
            if (timestamp - previousTimestamp > 16) {
              previousTimestamp = timestamp
              break
            }
          } while (true)
        }
        stackLoopCount += 1
      }
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
      let newString
      if (this.textBufferLastLine) {
        newString = this.textBufferLastLine.substring(0, this.textBufferLastLine.length - 1)
      }

      if (newString == null || newString === '') {
        this.textBuffer.pop()
        this.textBufferLineOffsets.pop()
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
    textBufferSwapChar: function (char) {
      // maybe just use textBufferBackspace and then textBufferAppend(char)?
      this.textBuffer[this.textBuffer.length - 1] = this.textBufferLastLine.substring(0, this.textBufferLastLine.length - 1) + char
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
        url: URL.createObjectURL(blob), // Shall be eventually revoked by chat queue
        blob: blob,
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
    },
    generateBrushesImages: function () {
      const images = {}
      this.brushes.forEach(brush => {
        const image = new Image()
        image.src = this.$tileMap(brush).url
        images[brush] = image
      })

      return images
    },
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
  touch-action: pinch-zoom; /* will keep screen from zooming or panning when touching in mobile */
}

.canvas-buffer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.canvas-buffer2 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  /*visibility: hidden;*/
}
</style>
