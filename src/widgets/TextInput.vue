<template>
  <div class="input">
    <div class="tile tile-input-border" :style="getPreBorderLeft"/>
    <template v-for="(i, index) in chars" :key="i">
      <template v-if="index === caretPosition">
        <div class="tile tile-input" :style="getCaretStyle"/>
      </template>
      <template v-else-if="index === 0">
        <div class="tile tile-input" :style="getBorderLeftStyle">
          {{ modelValue.substring(index, index + 1) }}
        </div>
      </template>
      <template v-else>
        <div class="tile tile-input" :style="getInputStyle">
          {{ modelValue.substring(index, index + 1) }}
        </div>
      </template>
    </template>
    <div class="tile tile-input-border" :style="getPostBorderRight"/>
  </div>
</template>

<script>
export default {
  name: 'TextInput',
  emits: ['update:modelValue'],
  props: {
    chars: {
      type: Number,
      required: false,
      default: 10
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
    }
  },
  computed: {
    caretPosition: function () {
      return this.modelValue.length
    },
    getPreBorderLeft: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}
      const tile = this.$tileMap('grid-background-input-pre-border-left')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    getBorderLeftStyle: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}
      const tile = this.$tileMap('grid-background-input-border-left')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    getInputStyle: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}
      const tile = this.$tileMap('grid-background-input')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    getPostBorderRight: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}
      const tile = this.$tileMap('grid-background-input-post-border-right')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    getCaretStyle: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}
      const tile = this.$tileMap('grid-background-input-caret')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.tile {
  width: calc(16px * var(--global-ss));
  height: calc(16px * var(--global-ss));
  /*display: inline-block;*/
}

.tile-input {
  border-bottom: calc(1px * var(--global-ss)) solid black;
  color: white;
  text-align: center;
  line-height: calc(16px * var(--global-ss));
}

.tile-input-border {
  border-bottom: calc(1px * var(--global-ss)) solid #c3c3c3;
}

.input {
  display: flex;
  justify-content: center;
}
</style>
