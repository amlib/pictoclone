<template>
  <canvas ref="canvas" :width="width" :height="height" class="canvas"
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
    toolSize: {
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
      painting: false
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
      this.canvasContext.lineWidth = this.toolSize

      if (this.tool === 'eraser') {
        // WARNING: assuming blank canvas is white and alpha is zero
        this.canvasContext.strokeStyle = '#fff'
        this.canvasContext.globalCompositeOperation = 'destination-out'
      } else {
        this.canvasContext.strokeStyle = this.toolColor
        this.canvasContext.globalCompositeOperation = 'source-over'
      }

      this.canvasContext.imageSmoothingEnabled = false
      this.canvasContext.beginPath()
      this.canvasContext.save()
      this.canvasContext.moveTo(x, y)
    },
    moveStroke: function (x, y) {
      if (this.painting) {
        this.canvasContext.imageSmoothingEnabled = false
        this.canvasContext.lineTo(x, y)
        this.canvasContext.imageSmoothingEnabled = false
        this.canvasContext.stroke()
      }
    },
    endStroke: function (x, y) {
      this.canvasContext.restore()
      this.painting = false
    }
  }
}
</script>

<style scoped>
.canvas {
  image-rendering: pixelated;
  touch-action:none; /* will keep screen from zooming or panning when touching in mobile */
}
</style>
