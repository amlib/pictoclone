<template>
  <w-plate class="message-area" normal-tile="main-drawing-area"
           :notch="[true, true, true, true]"
           :stripe-mode=2 global-tint>
    <w-drawing-canvas v-if="mode === 'edit'" :width="width" :height="height" ref="drawing"
      class="drawing-area" :target-width="targetWidth" :target-height="targetHeight"
      :tool="selectedTool" :brush-size="brushSize" text-font="10px NDS12" :line-height="16"/>
    <div v-else-if="mode === 'view'" class="drawing-area"
         :style="{ width: targetWidth + 'px', height: targetHeight +'px' }">
    </div>
    <w-plate class="message-area-user-tag" normal-tile="main-color-background"
             :notch="[true, false, true, false]" global-tint>
      <div class="global-color-hue-tint">user...</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WDrawingCanvas from '@/widgets/DrawingCanvas'

// TODO define message core dimensions elsewhere
const width = 228
const height = 80
const defaultTextX = 41
const defaultTextY = 13

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
    }
  },
  data: function () {
    return {
      width,
      height,
      mode: 'edit'
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

    this.defaultTextX = defaultTextX
    this.defaultTextY = defaultTextY
    this.specialKeys = specialKeys
  },
  mounted: function () {
    if (this.mode === 'edit') {
      this.$refs.drawing.textBufferSetStart(this.defaultTextX, this.defaultTextY)
    }
  },
  computed: {
    targetWidth: function () {
      return this.width * this.$global.superSample
    },
    targetHeight: function () {
      return this.height * this.$global.superSample
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
  margin-bottom: calc(3px * var(--global-ss));
  margin-right: calc(2px * var(--global-ss));
  position: relative;
  display: block;
}

.message-area-user-tag {
  user-select: none;
  position: absolute;
  left: 0;
  top: 0;
  padding: 0 calc(2px * var(--global-ss));
  color: red;
}
.drawing-area {
  margin-top: calc(-1px * var(--global-ss));
  margin-bottom: calc(-2px * var(--global-ss));
  margin-left: calc(-1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
}
</style>
