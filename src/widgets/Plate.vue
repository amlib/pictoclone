<template>
  <div class="plate" :style="plateStyle">
    <template v-if="!tileMode">
      <div class="plate-slice" :style="scaledPlateStyle"/>
      <div v-if="stripeMode" :class="[ 'plate-slice', 'scaled-mode-stripe-' + stripeMode ]"/>
    </template>
    <template v-else>
      <div :class="[ 'plate-slice' ]" :style="tiledStraightTBSlices"></div>
      <div :class="[ 'plate-slice' ]" :style="tiledStraightLRSlices"></div>
      <div v-if="!noBorders" :class="[ 'plate-slice' ]" :style="tiledCornerSlices"></div>
    </template>
    <slot></slot>
  </div>
</template>

<script>
import { tileSpec } from '/src/mapper/tilemap'

export default {
  name: 'WPlate',
  props: {
    padding: {
      type: Number,
      required: false,
      default: null
    },
    noBorders: {
      type: Boolean,
      required: false,
      default: false
    },
    // notch in clockwise order: TL TR BR BL
    notch: {
      type: Array,
      required: false,
      default: null
    },
    tileName: {
      type: String,
      required: false,
      default: 'main-button'
    },
    stripeMode: {
      type: Number,
      required: false,
      default: null
    },
    colorIndex: {
      type: Number,
      required: false,
      default: null
    },
    tileMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      over: false,
      click: false
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
    plateStyle: function () {
      return {
        padding: this.internalPadding + 'px'
      }
    },
    getColorIndex: function () {
      return this.colorIndex != null ? this.colorIndex : this.$global.userColorIndex
    },
    scaledPlateStyle: function () {
      const ss = this.$global.superSample
      // fixes chrome slight tile unaligment (artifacts) issues (due to autoscale css scale transform)
      // also, causes other side effects, but still looks better...
      const fix = this.$global.chromeFix && this.$global.autoScale ? (ss < 2 ? 0 : 0.4) : 0
      const obj = {}

      if (this.noBorders) {
        const tile = this.tileName + '-center'
        const img = this.$tileMap(tile, this.getColorIndex)
        if (img == null) {
          throw new Error('Could not find tile: ' + tile)
        }

        obj.backgroundImage = 'url(' + img.url + ')'
        obj.backgroundSize = '100% 100%'
      } else {
        for (let s = 0; s < tileSpec.length; ++s) {
          const spec = tileSpec[s]

          for (let i = 0; i < spec.variants.length; ++i) {
            const variant = spec.variants[i]

            let notch = ''
            if (spec.notchable && this.notch) {
              if (variant === 'tl') {
                notch = this.notch[0] ? '1' : '2'
              } else if (variant === 'tr') {
                notch = this.notch[1] ? '1' : '2'
              } else if (variant === 'br') {
                notch = this.notch[2] ? '1' : '2'
              } else if (variant === 'bl') {
                notch = this.notch[3] ? '1' : '2'
              } else {
                notch = '2'
              }
            } else if (spec.notchable) {
              notch = '2'
            }

            const tile = this.tileName + '-' + spec.name + notch + (variant && variant !== '' ? ('-' + variant) : '')
            const img = this.$tileMap(tile, this.getColorIndex)
            if (img == null) {
              throw new Error('Could not find tile: ' + tile)
            }

            const slice = {
              backgroundImage: 'url(' + img.url + ')',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `
                ${spec.positionX[variant]} ${img.offsetX}px
                ${spec.positionY[variant]} ${img.offsetY}px`,
              backgroundSize:
                (spec.sizeX[variant] ? `calc(100% - ${img.offsetY * 2 - fix}px)` : `${img.w + fix}px`) + ' ' +
                (spec.sizeY[variant] ? `calc(100% - ${img.offsetX * 2 - fix}px)` : `${img.h + (fix * 2)}px`)
            }

            this.mergeSlice(obj, slice)
          }
        }
      }

      return obj
    },
    tiledCornerSlices: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}

      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notch && this.notch[0] ? '1' : '2') + '-tl'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notch && this.notch[1] ? '1' : '2') + '-tr'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notch && this.notch[2] ? '1' : '2') + '-br'))
      this.mergeSlice(obj, this.getSlice(this.tileName + '-corner' + (this.notch && this.notch[3] ? '1' : '2') + '-bl'))

      return obj
    },
    tiledStraightLRSlices: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}

      if (this.stripeMode === 1) {
        obj.backgroundImage = 'linear-gradient(0deg, #bababa calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 4px), #bababa calc(var(--global-ss) * 4px), #bababa calc(var(--global-ss) * 5px), transparent calc(var(--global-ss) * 5px), transparent calc(var(--global-ss) * 8px))'
        obj.backgroundPosition = 'bottom'
        obj.backgroundRepeat = 'repeat-y'
        obj.backgroundSize = 'calc(100% - calc(var(--global-ss) * 2px)) calc(var(--global-ss) * 8px), auto, auto'
      } else if (this.stripeMode === 2) {
        obj.backgroundImage = 'linear-gradient(0deg, var(--global-cl1) calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 16px), var(--global-cl1) calc(var(--global-ss) * 16px), var(--global-cl1) calc(var(--global-ss) * 17px), transparent calc(var(--global-ss) * 17px), transparent calc(var(--global-ss) * 32px))'
        obj.backgroundPosition = 'top'
        obj.backgroundRepeat = 'repeat-y'
        obj.backgroundSize = 'calc(100% - calc(var(--global-ss) * 6px)) calc(var(--global-ss) * 32px - 1px), auto, auto'
      }

      if (!this.noBorders) {
        this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-l'))
        this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-r'))
      }

      return obj
    },
    tiledStraightTBSlices: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}

      if (this.noBorders) {
        const tile = this.tileName + '-center'
        const img = this.$tileMap(tile, this.getColorIndex)
        if (img == null) {
          throw new Error('Could not find tile: ' + tile)
        }

        obj.backgroundImage = 'url(' + img.url + ')'
        // obj.backgroundRepeat = 'repeat'
      } else {
        this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-t'))
        this.mergeSlice(obj, this.getSlice(this.tileName + '-straight-b'))
        this.mergeSlice(obj, this.getSlice(this.tileName + '-center'))
      }

      return obj
    }
  },
  methods: {
    getSlice: function (alias) {
      const obj = {}
      const img = this.$tileMap(alias, this.getColorIndex)
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
  position: relative;
  z-index: 0;
}

.plate-slice {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
}

.rendering-pixel .plate-slice {
  image-rendering: pixelated;
}
.rendering-quality .plate-slice {
  image-rendering: smooth;
}

.scaled-mode-stripe-1 {
  background-image: linear-gradient(0deg, #bababa calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 4px), #bababa calc(var(--global-ss) * 4px), #bababa calc(var(--global-ss) * 5px), transparent calc(var(--global-ss) * 5px), transparent calc(var(--global-ss) * 8px));
  background-position: bottom;
  background-repeat: repeat-y;
  background-size: calc(100% - (var(--global-ss) * 2px)) calc(var(--global-ss) * 8px);
  top: calc(var(--global-ss) * 4px);
  bottom: calc(var(--global-ss) * 4px);
}

.scaled-mode-stripe-2 {
  background-image: linear-gradient(0deg, var(--global-cl1) calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 16px), var(--global-cl1) calc(var(--global-ss) * 16px), var(--global-cl1) calc(var(--global-ss) * 17px), transparent calc(var(--global-ss) * 17px), transparent calc(var(--global-ss) * 32px));
  background-position: top;
  background-repeat: repeat-y;
  background-size: calc(100% - (var(--global-ss) * 6px)) calc(var(--global-ss) * 32px);
  top: calc(var(--global-ss) * 3px);
  bottom: calc(var(--global-ss) * 4px);
}

/*.tiled-mode-stripe-1 {*/
/*  background-image: linear-gradient(0deg, #bababa calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 4px), #bababa calc(var(--global-ss) * 4px), #bababa calc(var(--global-ss) * 5px), transparent calc(var(--global-ss) * 5px), transparent calc(var(--global-ss) * 8px));*/
/*  background-position: bottom;*/
/*  background-repeat: repeat-y;*/
/*  background-size: calc(100% - calc(var(--global-ss) * 2px)) calc(var(--global-ss) * 8px), auto, auto;*/
/*}*/

/*.tiled-mode-stripe-2 {*/
/*  background-image: linear-gradient(0deg, var(--global-cl1) calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 1px), transparent calc(var(--global-ss) * 16px), var(--global-cl1) calc(var(--global-ss) * 16px), var(--global-cl1) calc(var(--global-ss) * 17px), transparent calc(var(--global-ss) * 17px), transparent calc(var(--global-ss) * 32px));*/
/*  background-position: top;*/
/*  background-repeat: repeat-y;*/
/*  background-size: calc(100% - calc(var(--global-ss) * 6px)) calc(var(--global-ss) * 32px - 1px), auto, auto;*/
/*}*/
</style>
