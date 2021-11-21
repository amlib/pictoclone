<template>
  <div :class="getClass" :style="getStyle"/>
</template>

<script>
import { colorsHexL2 } from '/src/js/Colors'

export default {
  name: 'MiniEntry',
  props: {
    entry: {
      type: Object,
      required: true
    }
  },
  created () {
    this.colorsHexL2 = colorsHexL2
  },
  computed: {
    getStyle: function () {
      const obj = {}

      if (!this.entry.visible) {
        obj.backgroundColor = '#b2c3db'
      } else {
        if (this.entry.type === 'message') {
          obj.backgroundColor = colorsHexL2[this.entry.payload.colorIndex]
        } else if (this.entry.type === 'notification') {
          if (this.entry.payload.color === 'global') {
            obj.backgroundColor = 'var(--global-cl2)'
          } else {
            obj.backgroundColor = '#415969'
          }
        } else {
          throw new Error('unknown entry type: ' + this.entry.type)
        }
      }

      return obj
    },
    getClass: function () {
      const arr = ['mini-entry']

      if (this.entry.visible && this.entry.type === 'notification' && this.entry.payload.color === 'global') {
        arr.push('global-color-hue-tint')
      }

      return arr
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

.mini-entry-not-visible {
  background-color: black;
}
</style>
