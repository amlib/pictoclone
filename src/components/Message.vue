<template>
  <w-plate class="message-area" normal-tile="main-drawing-area"
           :notch="[true, true, true, true]"
           stripe-color="#fbbaba" :stripe-mode=2 global-tint>
    <w-drawing-canvas v-if="mode === 'edit'" :width="width" :height="height" ref="drawing"
      class="drawing-area" :target-width="targetWidth" :target-height="targetHeight"
      :tool="selectedTool" :brush-size="brushSize" text-font="10px NDS12" :line-height="16"/>
    <div v-else-if="mode === 'view'" class="drawing-area"
         :style="{ width: targetWidth + 'px', height: targetHeight +'px' }">
    </div>
    <w-plate class="message-area-user-tag" normal-tile="main-color-background"
             :notch="[true, false, true, false]" global-tint>
      <div class="globalColorHueTint">user...</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WDrawingCanvas from '@/widgets/DrawingCanvas'
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
    // TODO define message core dimensions elsewhere
    const width = 228
    const height = 80
    const defaultTextX = 41
    const defaultTextY = 13
    return {
      width,
      height,
      defaultTextX,
      defaultTextY,
      mode: 'edit',
      specialKeys: {
        enter: () => this.keyPressEnter(),
        backspace: () => this.keyPressBackspace(),
        space: () => this.keyPress(' ')
      }
    }
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
      } else if (key === 'q') {
        this.$refs.drawing.textBufferAppend('qqqqqqqqqqqqqq')
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
