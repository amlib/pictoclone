<template>
  <w-plate class="notification" tile-name="main-inverted"
           :notch="[true, true, true, true]">
    <div :style="getStyle" :class="['text', isGlobal && $global.rgbMode && 'global-rgb']">
      {{ notificationPayload.text }}
      <span v-if="notificationPayload.textB != null" :style="{ color: notificationPayload.colorB }">
        {{ notificationPayload.textB }}
      </span>
    </div>
  </w-plate>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'

export default {
  name: 'Notification',
  components: { WPlate },
  props: {
    notificationPayload: {
      type: Object,
      required: true
    }
  },
  computed: {
    isGlobal: function () {
      return this.notificationPayload.color === 'global'
    },
    getStyle: function () {
      const obj = {}

      if (this.isGlobal) {
        obj.color = 'var(--global-cl2)'
        if (this.$global.rgbMode) {
          obj.filter = `hue-rotate(${this.$global.rgbColorHueDeg}deg)`
        }
      } else {
        obj.color = this.notificationPayload.color ? this.notificationPayload.color : 'gray'
      }

      return obj
    }
  }
}
</script>

<style scoped>
.notification {
  display: block;
  color: gray;
  margin: calc(1px * var(--global-ss)) 0;
  min-height: calc(12px * var(--global-ss));
}

.text {
  pointer-events: all;
  user-select: text;
}
</style>
