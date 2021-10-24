<template>
  <button>
    <w-plate :hover-feedback="simple !== true" click-feedback :color-hue-deg="colorHueDeg"
             :notch-t-l="notchTL" :notch-t-r="notchTR" :notch-b-l="notchBL" :notch-b-r="notchBR"
             :normal-tile="simple ? (toggled ? 'small-button-highlight' : 'small-button') : (toggled ? 'main-color-fill' : 'main-button')"
             :click-tile="simple ? 'small-button-highlight' : 'main-color-fill'"
             :padding="padding != null ? padding : (simple ? 1 : 4)"
             @hovering="val => hovering = val" @clicking="val => clicking = val">
      <img v-if="icon" draggable="false" class="image" :src="iconImageSrc"/>
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
    colorHueDeg: {
      type: Number,
      required: false,
      default: null
    },
    notchTL: {
      type: Boolean,
      required: false,
      default: null
    },
    notchTR: {
      type: Boolean,
      required: false,
      default: null
    },
    notchBL: {
      type: Boolean,
      required: false,
      default: null
    },
    notchBR: {
      type: Boolean,
      required: false,
      default: null
    },
    simple: {
      type: Boolean,
      required: false,
      default: false
    },
    padding: {
      type: Number,
      required: false,
      default: null
    },
    name: {
      type: String,
      required: false,
      default: null
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
  computed: {
    iconImageSrc: function () {
      if (this.clicking || this.toggled) {
        return this.$imageMap('icon-color-fill-' + this.icon).url
      } else {
        return this.$imageMap('icon-normal-' + this.icon).url
      }
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
  image-rendering: pixelated;
  user-select: none;
}

</style>
