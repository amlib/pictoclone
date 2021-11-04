<template>
  <w-plate tile-name="main-foreground" :padding="0" v-bind="$attrs"
           :notch="[true, true, true, true]">
    <div v-if="layouts[mode]" :class="['keyboard', mode]" ref="keyboard"
         @pointerdown="pointerDown" @pointermove="pointerMoveThrottled" @pointerup="pointerUp" @pointercancel="pointerCancel">
      <template v-for="(section, index) in layouts[mode].sections" :key="index">
        <div :class="section.class">
          <template v-for="(key, keyIndex) in section.keys" :key="key">
            <w-button :text="key" :class="uniqueKeyClass[key] ? uniqueKeyClass[key] : section.keyClass"
                      :normal-class="uniqueKeyTile[key] ? 'keyboard-spbutton-normal' : 'keyboard-button-normal'"
                      :active-class="uniqueKeyTile[key] ? 'keyboard-spbutton-active' : 'keyboard-button-active'"
                      icon-prefix-normal="icon-keyboard-normal"
                      icon-prefix-highlight="icon-keyboard-highlight"
                      :icon="uniqueKeyIcon[key] ? key : null" :icon-margin="uniqueKeyIconMargin[key]"
                      @pointerdown="(event) => keyDown(shifting ? section.shiftKeys[keyIndex] : key, event)"
                      @pointerup="(event) => keyUp(shifting ? section.shiftKeys[keyIndex] : key, event)"
                      :toggled="(key === 'shift' && shifting && !capsLocked) || (key === 'caps' && capsLocked) || (key === 'hiragana' && !capsLocked && !shifting) || (key === 'katakana' && (capsLocked || shifting))">
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
               tile-name="main-color-fill" :notch="[false, false, true, true]">
        {{ draggingSymbol }}
      </w-plate>
      <div class="symbol-drag-box-char">{{ draggingSymbol }}</div>
    </div>
    <div v-show="typingBubbleSymbol && $global.mobileAssists" class="symbol-drag-box"
         :style="{ left: this.typingBubbleOffsetX + 'px', top: this.typingBubbleOffsetY + 'px' }">
      <w-plate class="symbol-box-balloon" :padding="0" global-tint
               :tile-name="typingBubbleHighlight ? 'main-color-fill' : 'main-button'"
               :notch="[false, false, true, true]">
        {{ typingBubbleSymbol }}
      </w-plate>
    </div>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WButton from '@/widgets/Button'
import { throttle, debounce } from 'lodash'
import {
  layouts,
  uniqueKeyTile,
  uniqueKeyIcon,
  uniqueKeyIconMargin,
  uniqueKeyClass,
  komojiMap,
  tentenMap, maruMap
} from '@/js/Keyboard'
import { watch } from 'vue'

export default {
  name: 'Keyboard',
  emits: ['keyboard-key-press', 'symbol-drag', 'keyboard-swap-char'],
  components: { WButton, WPlate },
  props: {
    mode: {
      type: String,
      required: true
    },
    symbolDrop: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: function () {
    return {
      shifting: false,
      capsLocked: false,
      draggingSymbol: null,
      draggingOffsetX: 0,
      draggingOffsetY: 0,
      typingBubbleSymbol: null,
      typingBubbleOffsetX: 0,
      typingBubbleOffsetY: 0,
      typingBubbleHighlight: false,
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
    this.uniqueKeyClass = uniqueKeyClass
    this.keyRepeatInterval = null
    this.previousKey = undefined
  },
  mounted: function () {
    this.draggingCapturedElement = null
    this.pointerMoveThrottled = throttle(this.pointerMove, 16, { leading: true })
    this.unhighlightTypingBubbleDbounced = debounce(this.unhighlightTypingBubble, 150)
    this.hideTypingBubbleDbounced = debounce(this.hideTypingBubble, 500)
    this.startKeyRepeatDebounced = debounce(this.startKeyRepeat, 750)

    watch(() => this.mode, () => {
      this.shifting = false
      this.capsLocked = false
    })
  },
  beforeUnmount: function () {
    this.pointerMoveThrottled.cancel()
    this.pointerMoveThrottled = undefined
    this.unhighlightTypingBubbleDbounced.cancel()
    this.unhighlightTypingBubbleDbounced = undefined
    this.hideTypingBubbleDbounced.cancel()
    this.hideTypingBubbleDbounced = undefined
    this.startKeyRepeatDebounced.cancel()
    this.startKeyRepeatDebounced = undefined

    if (this.keyRepeatInterval) {
      clearInterval(this.keyRepeatInterval)
    }
  },
  methods: {
    keyDown: function (key, event) {
      window.navigator.vibrate(15)
      if (!this.uniqueKeyIcon[key]) {
        const button = event.target
        this.typingBubbleOffsetX = Math.round(button.offsetParent.offsetLeft + button.offsetWidth / 2)
        this.typingBubbleOffsetY = Math.round((button.offsetParent.offsetTop) + button.offsetHeight / 2)
        this.typingBubbleSymbol = key
        this.typingBubbleHighlight = true
        this.unhighlightTypingBubbleDbounced()
        this.hideTypingBubbleDbounced()
      }

      if (!this.uniqueKeyIcon[key] || key === 'enter' || key === 'backspace' || key === 'space') {
        this.startKeyRepeatDebounced(key)
      }
    },
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
      } else if (key === 'caps' || key === 'katakana') {
        this.capsLocked = !this.capsLocked
        if (this.capsLocked) {
          this.shifting = true
        } else {
          this.shifting = false
        }
      } else if (key === 'hiragana') {
        this.shifting = false
        this.capsLocked = false
      } else if (this.shifting && !this.capsLocked) {
        this.shifting = false
      }

      if (key === 'komoji' || key === 'tenten' || key === 'maru') {
        let newKey
        if (key === 'komoji') {
          newKey = komojiMap[this.previousKey]
        } else if (key === 'tenten') {
          newKey = tentenMap[this.previousKey]
        } else if (key === 'maru') {
          newKey = maruMap[this.previousKey]
        }

        if (newKey) {
          this.$emit('keyboard-swap-char', newKey)
        }

        return
      }

      this.previousKey = key
      this.$emit('keyboard-key-press', key)
    },
    startKeyRepeat: function (key) {
      this.keyRepeatInterval = setInterval(() => this.keyUp(key, null, true), 50)
    },
    unhighlightTypingBubble: function () {
      this.typingBubbleHighlight = false
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
        if (this.symbolDrop) {
          this.draggingSymbol = this.draggingCapturedElement.innerText
          if (this.draggingSymbol === '') {
            this.draggingSymbol = null
          }
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
        this.previousKey = this.draggingSymbol
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
  padding-bottom: calc(2px * var(--global-ss));
}

/* rows */

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

.kana .row1 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 2;
}

.kana .row2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 3;
}

.kana .row3 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 2;
}

.kana .row4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 1;
}

.kana .row5 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(-1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 0;
}

.accents .row1, .symbols1 .row1, .symbols2 .row1 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 2;
}

.accents .row2, .symbols1 .row2, .symbols2 .row2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  z-index: 3;
}

.accents .row3, .symbols1 .row3, .symbols2 .row3 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 2;
}

.accents .row4, .symbols1 .row4, .symbols2 .row4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 1;
}

.accents .row5, .symbols1 .row5, .symbols2 .row5 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: calc(-1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(-1px * var(--global-ss));
  z-index: 0;
}

/* keys */

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

.key-15px-slim {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
}

/* hack to make text label entirely cover the button, otherwise symbol dragging could miss its intended target target*/
.key-15px  .text {
  padding-bottom: calc(1px * var(--global-ss));
}

.text {
  line-height: calc(14px * var(--global-ss));
}

.small-enter {
  margin-bottom: calc(-16px * var(--global-ss));
}

.wide-kana-dash {
  min-width: calc(18px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 0, calc(100% - (3px * var(--global-ss))) 0, 100% calc(3px * var(--global-ss)), 100% 100%, 0 100%)
}

.small-space {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - (3px * var(--global-ss))), calc(100% - (3px * var(--global-ss))) 100%, 0 100%)
}

.komoji {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 0, 100% 0, 100% 100%, calc(3px * var(--global-ss)) 100%, 0 calc(100% - (3px * var(--global-ss))))
}

.hiragana {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 calc(3px * var(--global-ss)), calc(3px * var(--global-ss)) 0, 100% 0, 100% 100%, 0 100%);
}

/* dilates keys bounds for better mobile typing experience */
.mobile-assists .text {
  position: absolute;
  padding-top: calc(3px * var(--global-ss));
  top: calc(-3px * var(--global-ss));
  left: calc(-1px * var(--global-ss));
  right: calc(-1px * var(--global-ss));
  bottom: calc(-4px * var(--global-ss));
  /*ez hit box test:*/
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

.keyboard-button-normal {
  background-color: #EBEBEB
}

.keyboard-button-active {
  background-color: #fb9aa2;
}

.keyboard-spbutton-normal {
  background-color: #cbcbcb
}

.keyboard-spbutton-active {
  background-color: #fb9aa2;
}
</style>
