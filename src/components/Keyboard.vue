<template>
  <w-plate normal-tile="main-foreground" :padding="0" v-bind="$attrs"
           :notch="[true, true, true, true]">
    <div v-if="layouts[mode]" :class="['keyboard', mode]" ref="keyboard"
         @pointerdown="pointerDown" @pointermove="pointerMoveThrottled" @pointerup="pointerUp" @pointercancel="pointerCancel">
      <template v-for="(section, index) in layouts[mode].sections" :key="index">
        <div :class="section.class">
          <template v-for="(key, keyIndex) in section.keys" :key="key">
            <w-button :text="key" :class="section.keyClass" :padding="0" no-borders
                      :normal-tile="uniqueKeyTile[key] ? 'keyboard-special' : 'keyboard-normal'"
                      click-tile="keyboard-highlight"
                      icon-prefix-normal="icon-keyboard-normal"
                      icon-prefix-highlight="icon-keyboard-highlight"
                      :icon="uniqueKeyIcon[key] ? key : null" :icon-margin="uniqueKeyIconMargin[key]"
                      @pointerdown="(event) => keyDown(shifting ? section.shiftKeys[keyIndex] : key, event)" @pointerup="(event) => keyUp(shifting ? section.shiftKeys[keyIndex] : key, event)"
                      :toggled="(key === 'shift' && shifting && !capsLocked) || (key === 'caps' && capsLocked)">
              <div v-if="uniqueKeyIcon[key] == null" class="text">
                {{ shifting ? section.shiftKeys[keyIndex] : key }}
              </div>
            </w-button>
          </template>
        </div>
      </template>
    </div>
    <div v-show="draggingShow" class="symbol-drag-box"
         :style="{ left: this.draggingOffsetX + 'px', top: this.draggingOffsetY + 'px' }">
      <w-plate v-if="$global.mobileAssists" class="symbol-box-balloon" :padding="0" global-tint
               normal-tile="main-color-fill" :notch="[false, false, true, true]">
        {{ draggingSymbol }}
      </w-plate>
      <div class="symbol-drag-box-char">{{ draggingSymbol }}</div>
    </div>
    <div v-show="typingBubbleSymbol && $global.mobileAssists" class="symbol-drag-box"
         :style="{ left: this.typingBubbleOffsetX + 'px', top: this.typingBubbleOffsetY + 'px' }">
      <w-plate class="symbol-box-balloon" :padding="0" global-tint
               normal-tile="main-color-fill" :notch="[false, false, true, true]">
        {{ typingBubbleSymbol }}
      </w-plate>
    </div>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WButton from '@/widgets/Button'
import { throttle, debounce } from 'lodash'
import { layouts, uniqueKeyTile, uniqueKeyIcon, uniqueKeyIconMargin } from '@/js/Keyboard'

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
      typingBubbleSymbol: null,
      draggingOffsetX: 0,
      draggingOffsetY: 0,
      typingBubbleOffsetX: 0,
      typingBubbleOffsetY: 0,
      draggingShow: false
    }
  },
  computed: {
  },
  created: function () {
    this.layouts = Object.freeze(layouts)
    this.uniqueKeyTile = uniqueKeyTile
    this.uniqueKeyIcon = uniqueKeyIcon
    this.uniqueKeyIconMargin = uniqueKeyIconMargin
    this.keyRepeatInterval = null
  },
  mounted: function () {
    this.draggingCapturedElement = null
    this.pointerMoveThrottled = throttle(this.pointerMove, 16, { leading: true })
    this.hideTypingBubbleDbounced = debounce(this.hideTypingBubble, 500)
    this.startKeyRepeatDebounced = debounce(this.startKeyRepeat, 750)
  },
  beforeUnmount: function () {
    this.pointerMoveThrottled.cancel()
    this.pointerMoveThrottled = undefined
    this.hideTypingBubbleDbounced.cancel()
    this.hideTypingBubbleDbounced = undefined
    this.startKeyRepeatDebounced.cancel()
    this.startKeyRepeatDebounced = undefined

    if (this.keyRepeatInterval) {
      clearInterval(this.keyRepeatInterval)
    }
  },
  methods: {
    keyUp: function (key, event, fromRepeat = false) {
      if (!fromRepeat) {
        this.startKeyRepeatDebounced.cancel()
        if (this.keyRepeatInterval) {
          clearInterval(this.keyRepeatInterval)
          this.keyRepeatInterval = null
          return
        }
        window.navigator.vibrate(40)
      } else {
        window.navigator.vibrate(15)
      }

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
    keyDown: function (key, event) {
      window.navigator.vibrate(10)
      if (!this.uniqueKeyIcon[key]) {
        const button = event.target
        this.typingBubbleOffsetX = Math.round(button.offsetParent.offsetLeft + button.offsetWidth / 2)
        this.typingBubbleOffsetY = Math.round((button.offsetParent.offsetTop) + button.offsetHeight / 2)
        this.typingBubbleSymbol = key
        this.hideTypingBubbleDbounced()
      }

      if (!this.uniqueKeyIcon[key] || key === 'enter' || key === 'backspace' || key === 'space') {
        this.startKeyRepeatDebounced(key)
      }
    },
    startKeyRepeat: function (key) {
      this.keyRepeatInterval = setInterval(() => this.keyUp(key, null, true), 50)
    },
    hideTypingBubble: function () {
      this.typingBubbleSymbol = null
    },
    pointerDown: function (event) {
      if (event.buttons & 1) {
        if (event.target.classList[0] === 'text') {
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
        window.navigator.vibrate(80)
        this.startKeyRepeatDebounced.cancel()
        if (this.keyRepeatInterval) {
          clearInterval(this.keyRepeatInterval)
          this.keyRepeatInterval = null
        }
        this.hideTypingBubbleDbounced.flush()
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
        if (event.target.classList[0] === 'keyboard') {
          // kludge for firefox, sometimes offsetX and offsetY would jump to 0,0
          if (event.offsetX !== 0 && event.offsetY !== 0) {
            this.draggingShow = true
            this.draggingOffsetX = event.offsetX
            this.draggingOffsetY = event.offsetY
          }
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

      this.draggingShow = false
      this.draggingSymbol = null
    },
    pointerCancel: function (event) {
      this.$refs.keyboard.releasePointerCapture(event.pointerId)
      if (this.draggingCapturedElement) {
        this.draggingCapturedElement.releasePointerCapture(event.pointerId)
        this.draggingCapturedElement = null
      }

      this.draggingShow = false
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

/* z-index necessary for key mobile-assists to work */
.romaji .row1 {
  display: flex;
  flex-direction: row;
  margin-left: calc(3px * var(--global-ss));
  z-index: 2;
}
.romaji .row2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  z-index: 3;
}
.romaji .row3 {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  z-index: 2;
}
.romaji .row4 {
  display: flex;
  flex-direction: row;
  z-index: 1;
}
.romaji .row5 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-left: calc(12px * var(--global-ss));
  z-index: 0;
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

/* dilates keys bounds for better mobile typing assists */
.mobile-assists .text {
  position: absolute;
  padding-top: calc(3px * var(--global-ss));
  top: calc(-3px * var(--global-ss));
  left: calc(-1px * var(--global-ss));
  right: calc(-1px * var(--global-ss));
  bottom: calc(-4px * var(--global-ss));
  /*background-color: rgba(255,0,0,0.2);*/
}

.mobile-assists .romaji .row1 .text {
  padding-top: calc(5px * var(--global-ss));
  top: calc(-5px * var(--global-ss));
  bottom: calc(-1px * var(--global-ss));
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
  z-index: 10;
}

.symbol-box-balloon {
  pointer-events: none;
  position: absolute;
  height: calc(40px * var(--global-ss) - 0.5em);
  width: calc(17px * var(--global-ss));
  top: calc(-40px * var(--global-ss) - 0.5em);
  text-align: center;
  line-height: calc(16px * var(--global-ss));
}

.symbol-drag-box-char {
  pointer-events: none;
  line-height: 0;
}
/*.key-caps {*/
/*  line-height: calc(14px * var(--global-ss));*/
/*  font-size: calc(6px * var(--global-ss));*/
/*  font-weight: bold;*/
/*}*/
</style>
