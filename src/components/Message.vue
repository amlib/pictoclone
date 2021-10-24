<template>
  <w-plate class="message-area" normal-tile="main-drawing-area"
           notch-b-l notch-b-r notch-t-l notch-t-r
           stripe-color="#fbbaba" :stripe-mode=2 global-tint>
    <canvas v-if="mode === 'edit'" class="drawing-area" ref="canvas"
            :width="width" :height="height"
            :style="{ width: targetWidth + 'px', height: targetHeight + 'px' }"/>
    <div v-else-if="mode === 'view'" class="drawing-area"
         :style="{ width: targetWidth + 'px', height: targetHeight +'px' }">
    </div>
    <w-plate class="message-area-user-tag" normal-tile="main-color-background"
             notch-t-l notch-b-r global-tint>
      <div :style="userNameStyle">user...</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
export default {
  name: 'Message',
  components: { WPlate },
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
    },
    userNameStyle: function () {
      const obj = {}
      obj.filter = 'hue-rotate(' + this.$global.colorHueDeg + 'deg)'
      return obj
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
