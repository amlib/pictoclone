<template>
  <w-plate class="message-area" normal-tile="main-drawing-area"
           notch-b-l notch-b-r notch-t-l notch-t-r
           stripe-color="#fbbaba" :stripe-mode=2 :color-hue-deg="220">
    <canvas v-if="mode === 'edit'" class="drawing-area"
            :width="width" :height="height"
            :style="{ width: targetWidth + 'px', height: targetHeight + 'px' }"/>
    <div v-else-if="mode === 'view'" class="drawing-area"
         :style="{ width: targetWidth + 'px', height: targetHeight +'px' }">
    </div>
    <w-plate class="message-area-user-tag" normal-tile="main-color-background"
             notch-t-l notch-b-r>
      <div>user...</div>
    </w-plate>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
export default {
  name: 'Message',
  components: { WPlate },
  data: function () {
    const width = 228
    const height = 80
    return {
      width,
      height,
      targetWidth: width * 2,
      targetHeight: height * 2,
      mode: 'edit'
    }
  }
}
</script>

<style scoped>
.message-area {
  margin-top: 2px;
  margin-bottom: 6px;
  margin-right: 4px;
  position: relative;
  display: block;
}

.message-area-user-tag {
  position: absolute;
  left: 0;
  top: 0;
  padding: 0 4px;
  color: red;
}
.drawing-area {
  margin-top: -2px;
  margin-bottom: -4px;
  margin-left: -2px;
  margin-right: -2px;
  line-height: 0;
  display: block;
}
</style>
