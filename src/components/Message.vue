<template>
  <w-plate class="message-area" normal-tile="main-drawing-area"
           notch-b-l notch-b-r notch-t-l notch-t-r
           stripe-color="#fbbaba" :stripe-mode=2 global-tint>
    <w-drawing-canvas v-if="mode === 'edit'" :width="width" :height="height" ref="drawing"
      class="drawing-area" :style="{ width: targetWidth + 'px', height: targetHeight + 'px' }"
      :tool="selectedTool" :brush-size="brushSize"/>
    <div v-else-if="mode === 'view'" class="drawing-area"
         :style="{ width: targetWidth + 'px', height: targetHeight +'px' }">
    </div>
    <w-plate class="message-area-user-tag" normal-tile="main-color-background"
             notch-t-l notch-b-r global-tint>
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
    return {
      width,
      height,
      mode: 'edit'
    }
  },
  created: function () {
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
      this.$refs.drawing.clear()
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
  line-height: 0;
  display: block;
}
</style>
