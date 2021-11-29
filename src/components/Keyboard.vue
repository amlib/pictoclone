<template>
  <w-plate tile-name="main-foreground" :padding="0" v-bind="$attrs"
           :notch="[true, true, true, true]">
    <div v-if="layouts[mode]" :class="['keyboard', mode]" ref="keyboard" :style="keyboardStyle"
         @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerCancel">
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
                      @pointerleave="keyLeave"
                      :toggled="(key === 'shift' && shifting && !capsLocked) || (key === 'caps' && capsLocked) || (key === 'hiragana' && !capsLocked && !shifting) || (key === 'katakana' && (capsLocked || shifting))">
              <div v-if="uniqueKeyIcon[key] == null" class="text">
                {{ shifting ? section.shiftKeys[keyIndex] : getKey(key) }}
              </div>
            </w-button>
          </template>
        </div>
      </template>
    </div>
    <typing-bubble v-show="draggingShow" :show-bubble="$global.mobileAssists"
                   :highlight="false" :offset-x="draggingOffsetX" :offset-y="draggingOffsetY">
      {{ draggingSymbol }}
      <template v-slot:outside>
        <div class="symbol-drag-box-char">{{ draggingSymbol }}</div>
      </template>
    </typing-bubble>
    <typing-bubble v-show="typingBubbleSymbol && $global.mobileAssists"
                   :highlight="typingBubbleHighlight" :offset-x="typingBubbleOffsetX" :offset-y="typingBubbleOffsetY">
      {{ typingBubbleSymbol }}
    </typing-bubble>
  </w-plate>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'
import WButton from '/src/widgets/Button.vue'
import { debounce } from 'lodash'
import {
  layouts,
  uniqueKeyTile,
  uniqueKeyIcon,
  uniqueKeyIconMargin,
  uniqueKeyClass,
  komojiMap,
  tentenMap, maruMap, uniqueKeyMap
} from '/src/js/Keyboard'
import { watch } from 'vue'
import TypingBubble from '/src/components/TypingBubble.vue'

export default {
  name: 'Keyboard',
  emits: ['keyboard-key-press', 'symbol-drag', 'keyboard-swap-char'],
  components: { TypingBubble, WButton, WPlate },
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
      draggingShow: false,
      typingBubbleSymbol: null,
      typingBubbleOffsetX: 0,
      typingBubbleOffsetY: 0,
      typingBubbleHighlight: false
    }
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
    this.unhighlightTypingBubbleDbounced = debounce(this.unhighlightTypingBubble, 150)
    this.hideTypingBubbleDbounced = debounce(this.hideTypingBubble, 500)
    this.startKeyRepeatDebounced = debounce(this.startKeyRepeat, 750)

    watch(() => this.mode, () => {
      this.shifting = false
      this.capsLocked = false
    })
  },
  beforeUnmount: function () {
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
  computed: {
    keyboardStyle: function () {
      const obj = {}
      if (this.$global.rgbMode) {
        obj['--btn-color-normal'] = '#ffebeb'
        obj['--btn-color-sp'] = '#ffcbcb'
      } else {
        obj['--btn-color-normal'] = '#EBEBEB'
        obj['--btn-color-sp'] = '#cbcbcb'
      }
      return obj
    }
  },
  methods: {
    keyDown: function (key, event) {
      this.$global.audio.playProgram('pc-keydown')
      if (!this.uniqueKeyIcon[key]) {
        const button = event.target
        this.typingBubbleOffsetX = Math.round(button.offsetParent.offsetLeft + button.offsetWidth / 2)
        this.typingBubbleOffsetY = Math.round((button.offsetParent.offsetTop) + button.offsetHeight / 2)
        this.typingBubbleSymbol = key
        this.typingBubbleHighlight = true
        this.unhighlightTypingBubbleDbounced()
        this.hideTypingBubbleDbounced()
      }

      if (!this.uniqueKeyIcon[key] || key === 'enter' || key === 'backspace' || key === 'space'
        || key === 'small-enter' || key === 'small-backspace' || key === 'small-space') {
        this.startKeyRepeatDebounced(key)
      }
    },
    keyUp: function (key, event, fromRepeat = false) {
      if (!fromRepeat) {
        if (this.startKeyRepeatDebounced != null) {
          this.startKeyRepeatDebounced.cancel()
        }

        if (this.keyRepeatInterval) {
          clearInterval(this.keyRepeatInterval)
          this.keyRepeatInterval = null
          return
        }
        this.$global.audio.playProgram('pc-keyup')
      } else {
        this.$global.audio.playProgram('pc-keyup', { vibrate: 0.15 })
      }

      if (key === 'shift') {
        this.shifting = !this.shifting
        this.capsLocked = false
      } else if (key === 'caps' || key === 'katakana') {
        this.capsLocked = !this.capsLocked
        this.shifting = this.capsLocked;
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
          this.$emit('keyboard-swap-char', this.getKey(newKey))
        }

        return
      }

      this.previousKey = key
      this.$emit('keyboard-key-press', this.getKey(key))
    },
    keyLeave: function () {
      if (this.startKeyRepeatDebounced != null) {
        this.startKeyRepeatDebounced.cancel()
      }

      if (this.keyRepeatInterval) {
        clearInterval(this.keyRepeatInterval)
        this.keyRepeatInterval = null
      }
    },
    startKeyRepeat: function (key) {
      if (this.keyRepeatInterval) {
        clearInterval(this.keyRepeatInterval)
      }
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
      this.keyboardRect = undefined
    },
    // WARNING triggered only by elements with associated text class dynamically registered in pointerDown
    pointerLeave: function (event) {
      if (this.draggingCapturedElement) {
        if (this.$global.vibration > 0) {
          window.navigator.vibrate && window.navigator.vibrate(this.$global.vibration * 0.8)
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
        requestAnimationFrame(() => {
          if (this.draggingSymbol) {
            // we dont want events relative to button text element or else we get wrong positions...
            if (event.target.classList[0] === 'keyboard') {
              if (!this.keyboardRect) {
                // must be invalidated occasionally or else when keyboard position on screen changes, things will break
                this.keyboardRect = event.target.getBoundingClientRect()
              }
              this.draggingShow = true
              this.draggingOffsetX = (event.clientX - this.keyboardRect.x) / this.$global.scalingFactor
              this.draggingOffsetY = (event.clientY - this.keyboardRect.y) / this.$global.scalingFactor
            }
          }
        })
      }
    },
    pointerUp: function (event) {
      if (this.draggingSymbol) {
        this.previousKey = this.draggingSymbol
        this.$emit('symbol-drag', {
          symbol: this.getKey(this.draggingSymbol),
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
    },
    getKey: function (key) {
      let mappedKey = uniqueKeyMap[key]
      return mappedKey != null ? mappedKey : key
    }
  }
}
</script>

<style scoped>
.keyboard {
  user-select: none;
  touch-action: pinch-zoom;
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
  margin-right: calc(-1px * var(--global-ss));
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

/* unique keys */

.small-enter {
  margin-bottom: calc(-16px * var(--global-ss));
}

.small-space {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - (3px * var(--global-ss))), calc(100% - (3px * var(--global-ss))) 100%, 0 100%)
}

.key-notched-tr {
  min-width: calc(18px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 0, calc(100% - (3px * var(--global-ss))) 0, 100% calc(3px * var(--global-ss)), 100% 100%, 0 100%)
}

.key-notched-bl {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 0, 100% 0, 100% 100%, calc(3px * var(--global-ss)) 100%, 0 calc(100% - (3px * var(--global-ss))))
}

.key-notched-tl {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  clip-path: polygon(0 calc(3px * var(--global-ss)), calc(3px * var(--global-ss)) 0, 100% 0, 100% 100%, 0 100%);
}

.key-wide {
  min-width: calc(17px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
}

/* mobile assists */

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

/* extra */

.symbol-drag-box-char {
  pointer-events: none;
  line-height: 0;
}

.keyboard-button-normal {
  background-color: var(--btn-color-normal)
}

.keyboard-button-active {
  background-color: var(--global-cl1);
}

.keyboard-spbutton-normal {
  background-color: var(--btn-color-sp)
}

.keyboard-spbutton-active {
  background-color: var(--global-cl1);
}
</style>
