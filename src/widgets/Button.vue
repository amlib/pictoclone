<template>
  <button :style="buttonStyle" :class="['button',
      globalTint ? 'global-color-hue-tint' : '',
      clicking || toggled ? activeClass : normalClass]"
      @pointerdown="onPointerDown" @pointerup="onPointerUp" @pointercancel="onPointerCancel" @pointerleave="onPointerLeave">
    <w-plate v-if="normalTile" :global-tint="false" :notch="plateNotch"
             :tile-name="toggled || clicking ? activeTile : normalTile"
             :padding="platePadding" :class="['button-plate', expandPlate ? 'plate-expand' : '']">
      <slot></slot>
      <div v-if="icon" class="plate-icon" :style="iconBase"></div>
    </w-plate>
    <slot v-if="!normalTile"></slot>
  </button>
</template>

<script>
import WPlate from '@/widgets/Plate'
export default {
  name: 'WButton',
  components: { WPlate },
  props: {
    icon: {
      type: String,
      required: false,
      default: null
    },
    // margin as [ top-bottom, left-right ]
    iconMargin: {
      type: Array,
      required: false,
      default: null
    },
    iconPrefixNormal: {
      type: String,
      required: false,
      default: 'icon-normal'
    },
    iconPrefixHighlight: {
      type: String,
      required: false,
      default: 'icon-color-fill'
    },
    normalClass: {
      type: String,
      required: false,
      default: ''
    },
    activeClass: {
      type: String,
      required: false,
      default: ''
    },
    colorHueDeg: {
      type: Number,
      required: false,
      default: null
    },
    globalTint: {
      type: Boolean,
      required: false,
      default: true
    },
    toggled: {
      type: Boolean,
      required: false,
      default: false
    },
    // props for w-plate
    plateNotch: {
      type: Array,
      required: false,
      default: null
    },
    platePadding: {
      type: Number,
      required: false,
      default: null
    },
    // passing normalTile props activates w-plate mode
    normalTile: {
      type: String,
      required: false,
      default: null
    },
    activeTile: {
      type: String,
      required: false,
      default: null
    },
    expandPlate: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      clicking: false
    }
  },
  created: function () {
  },
  computed: {
    iconBase: function () {
      const obj = {}
      const ss = this.$global.superSample
      let tile

      if (this.clicking || this.toggled) {
        tile = this.$tileMap(this.iconPrefixHighlight + '-' + this.icon)
      } else {
        tile = this.$tileMap(this.iconPrefixNormal + '-' + this.icon)
      }

      if (this.iconMargin) {
        const margin = this.iconMargin
        obj.width = `${tile.w + margin[1] * 2 * ss}px`
        obj.height = `${tile.h + margin[0] * 2 * ss}px`
      } else {
        obj.width = `${tile.w}px`
        obj.height = `${tile.h}px`
      }

      obj.backgroundImage = `url(${tile.url})`
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    buttonStyle: function () {
      let obj

      if (this.icon && !this.normalTile) {
        obj = this.iconBase
      } else {
        obj = {}
      }

      if (this.normalTile) {
        obj.backgroundColor = 'unset'
      }

      if (this.colorHueDeg) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      return obj
    }
  },
  methods: {
    onPointerDown: function (event) {
      if (event.buttons & 1) {
        this.clicking = true
      }
    },
    onPointerUp: function () {
      setTimeout(() => { this.clicking = false }, 150)
    },
    onPointerLeave: function () {
      setTimeout(() => { this.clicking = false }, 150)
    },
    onPointerCancel: function () {
      this.clicking = false
    }
  }
}
</script>

<style scoped>
.button {
  padding: unset;
  border: none;
  position: relative;
  background-repeat: no-repeat;
  background-position: center;
}

.plate-icon {
  background-repeat: no-repeat;
  background-position: center;
}

.plate-expand {
  display: contents;
}

.rendering-pixel button {
  image-rendering: pixelated;
}
.rendering-quality button {
  image-rendering: high-quality;
}

</style>
