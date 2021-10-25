<template>
  <canvas ref="canvas" :width="width" :height="height" class="canvas" v-bind="$attrs"
          @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerCancel"/>
</template>

<script>
export default {
  name: 'WDrawingCanvas',
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
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
    }
  },
  data: function () {
    return {
      canvasContext: null,
      painting: false,
      stroking: false,
      beginPosition: { x: 0, y: 0 },
      brushType: 'brush-normal',
      brushes: [
        'brush-normal-1px',
        'brush-normal-2px'
      ]
    }
  },
  computed: {
    brush: function () {
      return this.brushType + '-' + this.brushSize + 'px'
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
    }
  },
  mounted: function () {
    this.canvasContext = this.$refs.canvas.getContext('2d')
  },
  methods: {
    pointerDown: function (event) {
      this.$refs.canvas.setPointerCapture(event.pointerId)
      this.startStroke(event.offsetX / this.$global.superSample, event.offsetY / this.$global.superSample)
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
    }
  }
}
</script>

<style scoped>
.canvas {
  image-rendering: pixelated;
  touch-action:none; /* will keep screen from zooming or panning when touching in mobile */
}
.brush-image {
  display: none;
  position: absolute;
  line-height: 0;
}
</style>
