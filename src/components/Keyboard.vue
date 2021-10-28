<template>
  <w-plate normal-tile="main-foreground" :padding="0"
           :notch="[true, true, true, true]">
    <div v-if="layouts[mode]" class="keyboard" ref="keyboard"
         @pointerdown="pointerDown" @pointermove="throttledPointerMove" @pointerup="pointerUp" @pointercancel="pointerCancel">
      <template v-for="(section, index) in layouts[mode].sections" :key="index">
        <div :class="section.class">
          <template v-for="(key, keyIndex) in section.keys" :key="key">
            <w-button :text="key" :class="section.keyClass" :padding="0" no-borders
                      :normal-tile="uniqueKeyTile[key] ? 'keyboard-special' : 'keyboard-normal'"
                      click-tile="keyboard-highlight"
                      icon-prefix-normal="icon-keyboard-normal"
                      icon-prefix-highlight="icon-keyboard-highlight"
                      :icon="uniqueKeyIcon[key] ? key : null" :icon-margin="uniqueKeyIconMargin[key]"
                      @click="keyPress(shifting ? section.shiftKeys[keyIndex] : key)"
                      :toggled="(key === 'shift' && shifting && !capsLocked) || (key === 'caps' && capsLocked)">
              <div v-if="uniqueKeyIcon[key] == null" :class="uniqueKeyClass[key] ? uniqueKeyClass[key] : 'text'">
                {{ shifting ? section.shiftKeys[keyIndex] : key }}
              </div>
            </w-button>
          </template>
        </div>
      </template>
    </div>
    <div v-if="draggingEvent" class="symbol-drag-box" :style="symbolDragBoxPosition">
      <div>{{ draggingSymbol }}</div>
    </div>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WButton from '@/widgets/Button'
import { throttle } from 'lodash'

const layouts = {
  romaji: {
    sections: [
      {
        class: 'romaji-row1',
        keyClass: 'key-14px',
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
        shiftKeys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+']
      },
      {
        class: 'romaji-row2',
        keyClass: 'key-15px',
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'backspace'],
        shiftKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'backspace']
      },
      {
        class: 'romaji-row2',
        keyClass: 'key-15px',
        keys: ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter'],
        shiftKeys: ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'enter']
      },
      {
        class: 'romaji-row4',
        keyClass: 'key-15px',
        keys: ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        shiftKeys: ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
      },
      {
        class: 'romaji-row5',
        keyClass: 'key-14px',
        keys: [';', '\'', 'space', '[', ']'],
        shiftKeys: [':', '"', 'space', '{', '}']
      }
    ]
  }
}

const uniqueKeyTile = {
  backspace: true,
  enter: true,
  caps: true,
  shift: true,
  space: true
}

const uniqueKeyIcon = {
  backspace: true,
  enter: true,
  caps: true,
  shift: true,
  space: true
}

const uniqueKeyIconMargin = {
  backspace: [1, 1, 1, 1],
  enter: [1, 1, 1, 1],
  caps: [1, 1, 1, 1],
  shift: [1, 1, 1, 1],
  space: [1, 29, 1, 29]
}

const uniqueKeyClass = {
}

export default {
  name: 'Keyboard',
  emits: ['keyboard-key-press', 'symbol-drag'],
  components: { WButton, WPlate },
  props: {
    mode: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      shifting: false,
      capsLocked: false,
      draggingSymbol: null,
      draggingEvent: null
    }
  },
  computed: {
    symbolDragBoxPosition: function () {
      if (this.draggingSymbol) {
        return {
          top: this.draggingEvent.offsetY + 'px',
          left: this.draggingEvent.offsetX + 'px'
        }
      } else {
        return {}
      }
    }
  },
  created: function () {
    this.layouts = layouts
    this.uniqueKeyTile = uniqueKeyTile
    this.uniqueKeyIcon = uniqueKeyIcon
    this.uniqueKeyIconMargin = uniqueKeyIconMargin
    this.uniqueKeyClass = uniqueKeyClass
  },
  mounted: function () {
    this.draggingCapturedElement = null
    this.throttledPointerMove = throttle(this.pointerMove, 16, { leading: true })
  },
  beforeUnmount: function () {
    this.throttledPointerMove.cancel()
    this.throttledPointerMove = undefined
  },
  methods: {
    keyPress: function (key) {
      if (key === 'shift') {
        this.shifting = !this.shifting
        this.capsLocked = false
      } else if (key === 'caps') {
        this.capsLocked = !this.capsLocked
        if (this.capsLocked) {
          this.shifting = true
        } else {
          this.shifting = false
        }
      } else if (this.shifting && !this.capsLocked) {
        this.shifting = false
      }

      this.$emit('keyboard-key-press', key)
    },
    pointerDown: function (event) {
      if (event.buttons & 1) {
        if (event.target.className === 'text') {
          window.navigator.vibrate(33)
          event.target.addEventListener('pointerleave', this.pointerLeave)

          // this is needed to make pointerLeave trigger on mobile:
          // mobile seems to auto capture pointer?
          event.target.releasePointerCapture(event.pointerId)

          this.draggingCapturedElement = event.target
        }
      }
    },
    // triggered by element with text class dynamically registered in pointerDown
    pointerLeave: function (event) {
      if (this.draggingCapturedElement) {
        window.navigator.vibrate(16)
        this.draggingCapturedElement.removeEventListener('pointerleave', this.pointerLeave)
        this.$refs.keyboard.setPointerCapture(event.pointerId)
        this.draggingSymbol = this.draggingCapturedElement.innerText
        if (this.draggingSymbol === '') {
          this.draggingSymbol = null
        }
      }
    },
    pointerMove: function (event) {
      if (this.draggingSymbol) {
        // we dont want events relative to button text element or else we get wrong positions...
        if (event.target.className === 'keyboard') {
          this.draggingEvent = event
        }
      }
    },
    pointerUp: function (event) {
      if (this.draggingSymbol) {
        this.$emit('symbol-drag', {
          symbol: this.draggingSymbol,
          event: event
        })
      }

      this.$refs.keyboard.releasePointerCapture(event.pointerId)
      if (this.draggingCapturedElement) {
        this.draggingCapturedElement.releasePointerCapture(event.pointerId)
        this.draggingCapturedElement = null
      }

      this.draggingEvent = null
      this.draggingSymbol = null
    },
    pointerCancel: function (event) {
      this.$refs.keyboard.releasePointerCapture(event.pointerId)
      if (this.draggingCapturedElement) {
        this.draggingCapturedElement.releasePointerCapture(event.pointerId)
        this.draggingCapturedElement = null
      }

      this.draggingEvent = null
      this.draggingSymbol = null
    }
  }
}
</script>

<style scoped>
.keyboard {
  user-select: none;
  touch-action: none;
  display: flex;
  position: relative; /* necessary to make symbol dragging absolute positioning work! */
  flex-direction: column;
  padding-top: calc(1px * var(--global-ss));
  padding-left: calc(1px * var(--global-ss));
  padding-right: calc(2px * var(--global-ss));
  padding-bottom: calc(1px * var(--global-ss));
}

.romaji-row1 {
  display: flex;
  flex-direction: row;
  margin-left: calc(3px * var(--global-ss))
}
.romaji-row2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.romaji-row4 {
  display: flex;
  flex-direction: row;
}
.romaji-row5 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-left: calc(12px * var(--global-ss))
}

.key-14px {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(14px * var(--global-ss));
  margin-top: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
}

.key-15px {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-top: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
}

/* hack to make text label entirely cover the button, otherwise symbol dragging could miss its intended target target*/
.key-15px  .text {
  padding-bottom: calc(1px * var(--global-ss));
}

.text {
  line-height: calc(14px * var(--global-ss));
}

.symbol-drag-box {
  pointer-events: none;
  user-select: none;
  touch-action: none;
  position: absolute;
  height: 0;
  width: 0;
  display: flex;
  justify-content: center;
}

.symbol-drag-box > * {
  pointer-events: none;
  line-height: 0;
}
/*.key-caps {*/
/*  line-height: calc(14px * var(--global-ss));*/
/*  font-size: calc(6px * var(--global-ss));*/
/*  font-weight: bold;*/
/*}*/
</style>
