<template>
  <div :class="['mini-entry', isGlobal && $global.rgbMode && 'global-rgb']" :style="getStyle"/>
</template>

<script>
import { colorsHexFaded, colorsHexMain } from '/src/js/Colors'

export default {
  name: 'MiniEntry',
  props: {
    entry: {
      type: Object,
      required: true
    }
  },
  computed: {
    isGlobal: function () {
      return this.entry.payload.color === 'global'
    },
    getStyle: function () {
      const obj = {}

      if (this.entry.type === 'message') {
        if (!this.entry.visible) {
          obj.backgroundColor = colorsHexFaded[this.entry.payload.colorIndex]
        } else {
          obj.backgroundColor = colorsHexMain[this.entry.payload.colorIndex]
        }
      } else if (this.entry.type === 'notification') {
        if (!this.entry.visible) {
          obj.backgroundColor = '#D1D1D1'
        } else if (this.isGlobal) {
          obj.backgroundColor = 'var(--global-cl2)'
          if (this.$global.rgbMode) {
            obj.filter = `hue-rotate(${this.$global.rgbColorHueDeg}deg)`
          }
        } else {
          obj.backgroundColor = '#606060'
        }
      } else {
        throw new Error('unknown entry type: ' + this.entry.type)
      }

      return obj
    }
  }
}
</script>

<style scoped>
.mini-entry {
  height: calc(2px * var(--global-ss));
  margin-top: calc(2px * var(--global-ss));
  /*margin-bottom: calc(2px * var(--global-ss));*/
}
</style>
