<template>
  <div class="band">
    <div class="text" :style="textPosition">
      <slot></slot>
    </div>
    <div class="strip">
      <div :style="stripBottom" class="tile half-tile"></div>
    </div>
    <div class="strip">
      <div :style="stripBottom" class="tile"></div>
    </div>
    <div class="strip strip-half">
      <div :style="stripTop" class="tile"></div>
      <div :style="stripBottom" class="tile"></div>
    </div>
    <template v-for="column in strips" :key="column">
      <div class="strip" :style="{ marginTop: `calc(8px * var(--global-ss) * ${column})` }">
        <div :style="stripTop" class="tile"></div>
        <div :style="stripBottom" class="tile"></div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'DecoBand',
  props: {
    size: {
      type: Number,
      default: 0
    }
  },
  computed: {
    strips: function () {
      return [...Array(this.size).keys()]
    },
    stripTop: function () {
      const obj = {}
      const tile = this.$tileMap('deco-band-top')
      obj.backgroundImage = `url(${tile.url})`
      return obj
    },
    stripBottom: function () {
      const obj = {}
      const tile = this.$tileMap('deco-band-bottom')
      obj.backgroundImage = `url(${tile.url})`
      return obj
    },
    textPosition: function () {
      const obj = {}
      obj.top = `calc(${this.size - 2} * 4px * var(--global-ss))`
      return obj
    }
  }
}
</script>

<style scoped>
.band {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: row;
}

.strip {

}

.strip-half {
  margin-top: calc(-8px * var(--global-ss));
}

.tile { /* 8x16 tile */
  width: calc(8px * var(--global-ss));
  height: calc(16px * var(--global-ss));
}

.half-tile { /* which is actually 8x8 */
  height: calc(8px * var(--global-ss));
  background-position: 0 calc(8px * var(--global-ss));
}

.text {
  position: absolute;
  /* top is dynamic */
  left: calc(16px * var(--global-ss));
  right: calc(16px * var(--global-ss));
  transform: rotate(45deg);
  white-space: nowrap;
}
</style>
