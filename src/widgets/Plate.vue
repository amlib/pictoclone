<template>
  <div class="image">
    <div class="image-slice" :style="straightTBSlices"></div>
    <div class="image-slice" :style="straightLRSlices"></div>
    <div class="image-slice" :style="cornerSlices"></div>
    <div class="image-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WPlate',
  props: {
    color: {
      type: String,
      required: false,
      default: 'red'
    },
    notchTL: {
      type: Boolean,
      required: false,
      default: false
    },
    notchTR: {
      type: Boolean,
      required: false,
      default: false
    },
    notchBL: {
      type: Boolean,
      required: false,
      default: false
    },
    notchBR: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    cornerSlices: function () {
      const obj = {}
      this.mergeSlice(obj, this.getSlice('main-normal-corner1-tl'))
      this.mergeSlice(obj, this.getSlice('main-normal-corner1-tr'))
      this.mergeSlice(obj, this.getSlice('main-normal-corner1-bl'))
      this.mergeSlice(obj, this.getSlice('main-normal-corner1-br'))

      return obj
    },
    straightLRSlices: function () {
      const obj = {}
      this.mergeSlice(obj, this.getSlice('main-normal-straight-l'))
      this.mergeSlice(obj, this.getSlice('main-normal-straight-r'))

      return obj
    },
    straightTBSlices: function () {
      const obj = {}
      this.mergeSlice(obj, this.getSlice('main-normal-straight-t'))
      this.mergeSlice(obj, this.getSlice('main-normal-straight-b'))
      this.mergeSlice(obj, this.getSlice('main-normal-center'))

      return obj
    }
  },
  methods: {
    onClick: function () {
      console.log('TODO sound')
      this.$emit('click')
    },
    getSlice: function (alias) {
      const obj = {}
      const img = this.$imageMap(alias)
      if (img == null) {
        return null
      }

      obj.backgroundImage = 'url(' + img.url + ')'
      obj.backgroundRepeat = img.backgroundRepeat
      obj.backgroundPosition = img.backgroundPosition
      obj.top = img.top
      obj.left = img.left
      obj.bottom = img.bottom
      obj.right = img.right
      return obj
    },
    mergeSlice: function (a, b) {
      const attributes = ['backgroundImage', 'backgroundPosition', 'backgroundRepeat']
      for (let i = 0; i < attributes.length; ++i) {
        const att = attributes[i]
        if (a[att] && b[att]) {
          a[att] = a[att] + ' , ' + b[att]
        } else if (b[att]) {
          a[att] = b[att]
        }
      }

      a.top = b.top
      a.left = b.left
      a.bottom = b.bottom
      a.right = b.right
    }
  }
}
</script>

<style scoped>
.image {
  min-width: 16px;
  min-height: 16px;
  display: inline-block;
  position: relative;
}

.image-slice {
  image-rendering: pixelated;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
}

.image-content {
  z-index: 1;
  padding: 4px;
}

</style>
