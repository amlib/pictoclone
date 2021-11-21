<template>
  <w-plate class="notification" tile-name="main-inverted"
           :notch="[true, true, true, true]">
    <div :style="getStyle" :class="[ notificationPayload.color === 'global' ? 'global-color-hue-tint' : '']">{{ notificationPayload.text }}</div>
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
    getStyle: function () {
      const obj = {}

      if (this.notificationPayload.color === 'global') {
        obj.color = 'var(--global-cl2)'
      } else {
        obj.color = 'gray'
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
</style>
