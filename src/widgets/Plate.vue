<template>
  <div class="plate" :style="plateStyle"
       @mouseenter="hoverFeedback ? onMouseEnter() : null"
       @mouseleave="onMouseLeave"
       @mousedown="clickFeedback ? onMouseDown() : null"
       @mouseup="clickFeedback ? onMouseUp() : null">
    <template v-if="mode === 'scale'">
      <div :class="[ 'plate-slice', globalTint ? 'globalColorHueTint' : '' ]" :style="scaledPlateStyle"/>
      <div :class="[ 'plate-slice', globalTint ? 'globalColorHueTint' : '' ]" v-if="stripeMode" :style="scaledModeStripeStyle"/>
    </template>
    <template v-else-if="mode === 'tile'">
      <div :class="[ 'plate-slice', globalTint ? 'globalColorHueTint' : '' ]" :style="tiledStraightTBSlices"></div>
      <div :class="[ 'plate-slice', globalTint ? 'globalColorHueTint' : '' ]" :style="tiledStraightLRSlices"></div>
      <div :class="[ 'plate-slice', globalTint ? 'globalColorHueTint' : '' ]" :style="tiledCornerSlices"></div>
    </template>
    <slot></slot>
  </div>
</template>

<script>
import { tileSpec } from '@/mapper/tilemap'

export default {
  name: 'WPlate',
  emits: ['clicking', 'hovering', 'click'],
  props: {
    padding: {
      type: Number,
      required: false,
      default: null
    },
    colorHueDeg: {
      type: Number,
      required: false,
      default: null
    },
    globalTint: {
      type: Boolean,
      required: false,
      default: false
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
    },
    hoverFeedback: {
      type: Boolean,
      required: false,
      default: false
    },
    clickFeedback: {
      type: Boolean,
      required: false,
      default: false
    },
    normalTile: {
      type: String,
      required: false,
      default: 'main-button'
    },
    hoverTile: {
      type: String,
      required: false,
      default: 'main-highlight'
    },
    clickTile: {
      type: String,
      required: false,
      default: 'main-color-fill'
    },
    stripeMode: {
      type: Number,
      required: false,
      default: null
    },
    stripeColor: {
      type: String,
      required: false,
      defaults: '#bababa'
    }
  },
  data: function () {
    return {
      over: false,
      click: false,
      mode: 'scale'
    }
  },
  computed: {
    internalPadding: function () {
      if (this.padding == null) {
        return this.$global.superSample * 4
      } else {
        return this.$global.superSample * this.padding
      }
    },
    tileName: function () {
      if (this.click) {
        return this.clickTile
      } else if (this.over) {
        return this.hoverTile
      } else {
        return this.normalTile
      }
    },
    plateStyle: function () {
      return {
        padding: this.internalPadding + 'px'
      }
    },
    scaledModeStripeStyle: function () {
      const ss = this.$global.superSample
      const obj = {}

      if (this.colorHueDeg != null) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      if (this.stripeMode === 1) {
        obj.backgroundImage = `linear-gradient(0deg, ${this.stripeColor} ${ss}px, transparent ${ss}px, transparent ${ss * 4}px, ${this.stripeColor} ${ss * 4}px, ${this.stripeColor} ${ss * 5}px, transparent ${ss * 5}px, transparent ${ss * 8}px)`
        obj.backgroundPosition = 'bottom'
        obj.backgroundRepeat = 'repeat-y'
        obj.backgroundSize = `calc(100% - ${ss * 2}px) ${ss * 8}px`
        obj.top = `${ss * 4}px`
        obj.bottom = `${ss * 4}px`
      } else if (this.stripeMode === 2) {
        obj.backgroundImage = `linear-gradient(0deg, ${this.stripeColor} ${ss}px, transparent ${ss}px, transparent ${ss * 16}px, ${this.stripeColor} ${ss * 16}px, ${this.stripeColor} ${ss * 17}px, transparent ${ss * 17}px, transparent ${ss * 32}px)`
        obj.backgroundPosition = 'top'
        obj.backgroundRepeat = 'repeat-y'
        obj.backgroundSize = `calc(100% - ${ss * 6}px) ${ss * 32 - 1}px`
        obj.top = `${ss * 4}px`
        obj.bottom = `${ss * 4}px`
      }

      return obj
    },
    scaledPlateStyle: function () {
      // eslint-disable-next-line no-unused-vars
      const ss = this.$global.superSample
      const obj = {}

      if (this.colorHueDeg != null) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      for (let s = 0; s < tileSpec.length; ++s) {
        const spec = tileSpec[s]

        for (let i = 0; i < spec.variants.length; ++i) {
          const variant = spec.variants[i]

          let notch = ''
          if (spec.notchable) {
            if (variant === 'tl') {
              notch = this.notchTL ? '1' : '2'
            } else if (variant === 'tr') {
              notch = this.notchTR ? '1' : '2'
            } else if (variant === 'bl') {
              notch = this.notchBL ? '1' : '2'
            } else if (variant === 'br') {
              notch = this.notchBR ? '1' : '2'
            }
          }

          const tile = this.tileName + '-' + spec.name + notch + (variant && variant !== '' ? ('-' + variant) : '')
          const img = this.$tileMap(tile)
          if (img == null) {
            throw new Error('Could not find tile: ' + tile)
          }

          const slice = {
            backgroundImage: 'url(' + img.url + ')',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${spec.positionX[variant]} ${img.offsetX}px ${spec.positionY[variant]} ${img.offsetY}px`,
            backgroundSize: (spec.sizeX[variant] ? `calc(100% - ${img.offsetY * 2}px)` : `${img.w}px`) + ' ' +
              (spec.sizeY[variant] ? `calc(100% - ${img.offsetX * 2}px)` : `${img.h}px`)
          }

          this.mergeSlice(obj, slice)
        }
      }

      return obj
    },
    tiledCornerSlices: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}

      if (this.colorHueDeg != null) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notchTL ? '1' : '2') + '-tl'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notchTR ? '1' : '2') + '-tr'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notchBL ? '1' : '2') + '-bl'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notchBR ? '1' : '2') + '-br'))

      return obj
    },
    tiledStraightLRSlices: function () {
      const ss = this.$global.superSample
      const obj = {}

      if (this.colorHueDeg != null) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      if (this.stripeMode === 1) {
        obj.backgroundImage = `linear-gradient(0deg, ${this.stripeColor} ${ss}px, transparent ${ss}px, transparent ${ss * 4}px, ${this.stripeColor} ${ss * 4}px, ${this.stripeColor} ${ss * 5}px, transparent ${ss * 5}px, transparent ${ss * 8}px)`
        obj.backgroundPosition = 'bottom'
        obj.backgroundRepeat = 'repeat-y'
        obj.backgroundSize = `calc(100% - ${ss * 2}px) ${ss * 8}px, auto, auto`
      } else if (this.stripeMode === 2) {
        obj.backgroundImage = `linear-gradient(0deg, ${this.stripeColor} ${ss}px, transparent ${ss}px, transparent ${ss * 16}px, ${this.stripeColor} ${ss * 16}px, ${this.stripeColor} ${ss * 17}px, transparent ${ss * 17}px, transparent ${ss * 32}px)`
        obj.backgroundPosition = 'top'
        obj.backgroundRepeat = 'repeat-y'
        obj.backgroundSize = `calc(100% - ${ss * 6}px) ${ss * 32 - 1}px, auto, auto`
      }

      this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-l'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-r'))

      return obj
    },
    tiledStraightTBSlices: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}

      if (this.colorHueDeg != null) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-t'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-b'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-center'))

      return obj
    }
  },
  methods: {
    onMouseDown: function () {
      this.click = true
      this.$emit('clicking', this.click)
    },
    onMouseUp: function () {
      this.click = false
      this.$emit('clicking', this.click)
      this.$emit('click')
    },
    onMouseEnter: function () {
      this.over = true
      this.$emit('hovering', this.over)
    },
    onMouseLeave: function () {
      if (this.hoverFeedback) {
        this.over = false
        this.$emit('hovering', this.over)
      }

      if (this.clickFeedback) {
        this.click = false
        this.$emit('clicking', this.click)
      }
    },
    getSlice: function (alias) {
      const obj = {}
      const img = this.$tileMap(alias)
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
      const attributes = ['backgroundImage', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize']
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
.plate {
  display: inline-block;
  position: relative;
  z-index: 0;
}

.plate-slice {
  image-rendering: pixelated;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
}
</style>
