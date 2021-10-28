<template>
  <button>
    <w-plate click-feedback :color-hue-deg="colorHueDeg" :global-tint="globalTint" :notch="notch"
             :normal-tile="toggled ? clickTile : normalTile" :click-tile="clickTile"
             :no-borders="noBorders" :padding="padding != null ? padding : 1" class="button-plate"
             @hovering="val => hovering = val" @clicking="val => clicking = val">
      <img v-if="icon" draggable="false"
           :class="[ 'image', globalTint ? 'global-color-hue-tint' : '' ]"
           :src="iconImageSrc" :style="iconStyle"/>
      <slot></slot>
    </w-plate>
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
    // margin in clockwise order: top right bottom left
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
    text: {
      type: String,
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
      default: true
    },
    noBorders: {
      type: Boolean,
      required: false,
      default: false
    },
    notch: {
      type: Array,
      required: false,
      default: null
    },
    padding: {
      type: Number,
      required: false,
      default: null
    },
    normalTile: {
      type: String,
      required: false,
      default: 'small-button'
    },
    clickTile: {
      type: String,
      required: false,
      default: 'small-button-highlight'
    },
    toggled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      clicking: false,
      hovering: false
    }
  },
  created: function () {
    // this.$watch(() => this.$global.superSample, () => {
    //   this.key += 1
    // })
  },
  computed: {
    iconImageSrc: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      if (this.clicking || this.toggled) {
        return this.$tileMap(this.iconPrefixHighlight + '-' + this.icon).url
      } else {
        return this.$tileMap(this.iconPrefixNormal + '-' + this.icon).url
      }
    },
    iconStyle: function () {
      const obj = {}
      const ss = this.$global.superSample

      if (this.colorHueDeg) {
        obj.filter = 'hue-rotate(' + this.colorHueDeg + 'deg)'
      }

      if (this.iconMargin) {
        obj.margin = `${this.iconMargin[0] * ss}px ${this.iconMargin[1] * ss}px ${this.iconMargin[2] * ss}px ${this.iconMargin[3] * ss}px`
      }

      return obj
    }
  },
  methods: {
  }
}
</script>

<style scoped>
button {
  padding: unset;
  background-color: unset;
  border: none;
  line-height: 0;
}

.image {
  user-select: none;
  pointer-events: none;
}
.rendering-pixel .image {
  image-rendering: pixelated;
}
.rendering-quality .image {
  image-rendering: high-quality;
}

</style>
