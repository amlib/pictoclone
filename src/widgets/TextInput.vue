<template>
  <div :class="['input', denyBlink && 'deny']" ref="main" @transitionend="mainTransitionEnd">
    <template v-for="(lineNumber) in [...Array(lines).keys()]" :key="lineNumber">
      <div class="input-line">
        <div class="tile tile-input-border" :style="getPreBorderLeft"/>
        <template v-for="(i) in [...Array(lineSize).keys()]" :key="i">
          <template v-if="(lineNumber * lineSize) + i === caretPosition">
            <div class="tile tile-input tile-caret" :style="getCaretStyle"/>
          </template>
          <template v-else-if="i === 0">
            <div class="tile tile-input" :style="getBorderLeftStyle">
              {{ modelValue.substring((lineNumber * lineSize) + i, (lineNumber * lineSize) + i + 1) }}
            </div>
          </template>
          <template v-else>
            <div class="tile tile-input" :style="getInputStyle">
              {{ modelValue.substring((lineNumber * lineSize) + i, (lineNumber * lineSize) + i + 1) }}
            </div>
          </template>
        </template>
        <div class="tile tile-input-border" :style="getPostBorderRight"/>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'WTextInput',
  emits: ['update:modelValue'],
  props: {
    chars: {
      type: Number,
      required: false,
      default: 10
    },
    lines: {
      type: Number,
      required: false,
      default: 1
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      denyBlink: false
    }
  },
  computed: {
    lineSize: function () {
      return Math.round(this.chars / this.lines)
    },
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
  methods: {
    deny: function () {
      this.$global.audio.playProgram('pc-deny')
      this.denyBlink = true
    },
    mainTransitionEnd: function () {
      this.denyBlink = false
      this.$refs.main.classList.remove('deny')
    }
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
  flex-direction: column;
  justify-content: center;
  transition: filter 0.2s ease-in-out;
}

.input-line {
  display: flex;
  justify-content: center;
  margin-bottom: calc(-1px * var(--global-ss));
}

.tile-caret {
  animation: effect 0.4s ease-in-out alternate infinite;
}

.deny {
  filter: sepia(100%) saturate(400%) contrast(0.8) brightness(0.8) hue-rotate(-40deg);
}

@keyframes effect {
  0% {
    opacity: 1.0;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
