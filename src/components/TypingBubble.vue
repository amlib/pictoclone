<template>
  <div class="drag-box"
       :style="{ left: this.offsetX + 'px', top: this.offsetY + 'px' }">
    <w-plate v-if="showBubble" class="box-balloon" :padding="0" global-tint
             :tile-name="highlight ? 'main-color-fill' : 'main-button'"
             :notch="[false, false, true, true]">
      <slot/>
    </w-plate>
    <slot name="outside"/>
  </div>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'

export default {
  name: 'TypingBubble',
  components: { WPlate },
  props: {
    highlight: {
      type: Boolean,
      required: true
    },
    offsetX: {
      type: Number,
      required: true
    },
    offsetY: {
      type: Number,
      required: true
    },
    showBubble: {
      type: Boolean,
      required: false,
      default: true
    }
  }
}
</script>

<style scoped>
.drag-box {
  pointer-events: none;
  user-select: none;
  touch-action: none;
  position: absolute;
  height: 0;
  width: 0;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.box-balloon {
  pointer-events: none;
  position: absolute;
  height: calc(40px * var(--global-ss) - 0.5em);
  width: calc(17px * var(--global-ss));
  top: calc(-40px * var(--global-ss) - 0.5em);
  text-align: center;
  line-height: calc(16px * var(--global-ss));
}
</style>
