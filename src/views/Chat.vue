<template>
  <div class="main" :style="mainStyle">
    <div class="main-button-bar">
      <div class="main-button-bar-wrapper">
        <w-button class="closer" icon="arrow-up" :padding="0" no-borders/>
        <w-button class="closer" icon="arrow-down" :padding="0" no-borders/>
      </div>
      <div class="separator"></div>
      <w-button-toggle v-model="selectedTool" class="main-button-bar-wrapper"
      :common-options="{ class: 'closer', 'no-borders': true }"
      :options="[
        { icon: 'brush', name: 'brush' },
        { icon: 'eraser', name: 'eraser' }]">
      </w-button-toggle>
      <w-button-toggle v-model="brushSize" class="main-button-bar-wrapper"
        :common-options="{ class: 'closer', 'no-borders': true }"
        :options="[
        { icon: 'brush-big', name: 'brush-big' },
        { icon: 'brush-small', name: 'brush-small' }]">
      </w-button-toggle>
      <div class="separator"></div>
      <w-button-toggle v-model="keyboardMode" class="main-button-bar-wrapper"
      :common-options="{ notch: [true, false, false, false] }"
      :options="[
        { icon: 'romaji', name: 'romaji' },
        { icon: 'accents', name: 'accents' },
        { icon: 'kana', name: 'kana' },
        { icon: 'symbols1', name: 'symbols1' },
        { icon: 'symbols2', name: 'symbols2' }]">
      </w-button-toggle>
    </div>
    <div class="main-wrapper">
      <div class="main-queue-container">
        <w-plate class="main-queue-wrapper" normal-tile="main-background"
                 :notch="[true, true, true, true]" :padding="3"
                 :stripe-mode=1 stripe-color="#bababa">
          <div class="main-queue">
            <template v-for="m in [1,2]" :key="m">
              <w-plate class="test2" normal-tile="main-inverted"
                       :notch="[true, true, true, true]">
                Welcome to PICTOCLONE ☸
              </w-plate>
              <w-plate class="test2" normal-tile="main-drawing-area" style="height: 90px"
                       :stripe-mode="2" stripe-color="#fbbaba"
                       :notch="[true, true, true, true]"/>
            </template>
          </div>
        </w-plate>
      </div>
      <div class="main-interface-container">
        <w-plate class="main-interface-wrapper" normal-tile="main-background"
                 :notch="[true, false, false, true]" :padding="3"
                 :stripe-mode=1 stripe-color="#bababa">
          <message :selected-tool="selectedTool" :brush-size="brushSizes[brushSize]" ref="user-message"/>
          <div class="main-interface-bottom">
            <keyboard class="keyboard" :mode="keyboardMode"
                      @keyboard-key-press="handleKeyPress" @symbol-drag="handleSymbolDrag"/>
            <div class="button-cluster">
              <w-button class="button-cluster-button" icon="send"
                        normal-tile="main-button" click-tile="main-color-fill"
                        :notch="[true, false, false, false]" :padding="3"/>
              <w-button class="button-cluster-button" icon="copy"
                        normal-tile="main-button" click-tile="main-color-fill"
                        :padding="4" :style="`margin: ${$global.superSample * -1}px 0;`"/>
              <w-button class="button-cluster-button" icon="clear"
                        normal-tile="main-button" click-tile="main-color-fill"
                        :notch="[false, false, false, true]"  :padding="4"
                        @click="$refs['user-message'].clearDrawing()"/>
            </div>
          </div>
        </w-plate>
      </div>
    </div>
  </div>
</template>

<script>
import WButton from '@/widgets/Button'
import WPlate from '@/widgets/Plate'
import WButtonToggle from '@/widgets/ButtonToggle'
import Message from '@/components/Message'
import Keyboard from '@/components/Keyboard'
import { throttle } from 'lodash'

export default {
  name: 'Chat',
  components: { Keyboard, Message, WButtonToggle, WPlate, WButton },
  data: function () {
    return {
      keyboardMode: 'romaji',
      selectedTool: 'brush',
      brushSize: 'brush-big',
      brushSizes: {
        'brush-big': 2,
        'brush-small': 1
      },
      documentObserver: null,
      documentHeight: 1,
      documentWidth: 1
    }
  },
  computed: {
    mainStyle: function () {
      return {
        height: this.$global.autoScale ? `calc(${this.documentHeight}px * 1 / var(--global-sf))` : undefined
      }
    }
  },
  mounted: function () {
    this.onResizeThrottled = throttle(this.onResize, 16, { leading: false, trailing: true })
    this.documentObserver = new ResizeObserver(this.onResizeThrottled).observe(document.firstElementChild)
  },
  beforeUnmount: function () {
    if (this.documentObserver) {
      this.documentObserver.unobserve(document.firstElementChild.offsetWidth)
    }
    this.onResizeThrottled.cancel()
    this.onResizeThrottled = undefined
  },
  methods: {
    handleKeyPress: function (key) {
      this.$refs['user-message'].keyPress(key)
    },
    handleSymbolDrag: function (payload) {
      this.$refs['user-message'].symbolDrop(payload)
    },
    onResize: function () {
      // WARNING offsetHeight and offsetWidth returned by document.firstElementCHild may be
      // different from the one returned on App.vue when css scale is in effect
      this.documentHeight = document.firstElementChild.offsetHeight
      this.documentWidth = document.firstElementChild.offsetWidth
    }
  }
}
</script>

<style scoped>
.test2 {
  display: block;
  color: white;
  margin: calc(5px * var(--global-ss)) calc(1px * var(--global-ss));
  min-height: calc(12px * var(--global-ss));
}

.main {
  display: flex;
  flex-direction: row;
  background-color: #FBFBFB;
  max-width: max-content;
  height: 100%;
}

/* main-button-bar */

.main-button-bar {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.main-button-bar-wrapper {
  display: flex;
  flex-direction: column;
  row-gap: calc(1px * var(--global-ss));
}

.main-button-bar > .separator {
  min-height: calc(1px * var(--global-ss));
  background-image: linear-gradient(90deg, #ffffff 25%, #494949 25%, #494949 50%, #ffffff 50%, #ffffff 75%, #494949 75%, #494949 100%);
  background-size: calc(4px * var(--global-ss)) calc(4px * var(--global-ss));
}

/* also non scoped version */
.main-button-bar-wrapper > button {
  display: block;
  margin: calc(1px * var(--global-ss)) calc(2px * var(--global-ss));
}

/* also non scoped version */
.main-button-bar-wrapper > button:first-child {
  margin-top: calc(3px * var(--global-ss));
}

/* also non scoped version */
.main-button-bar-wrapper > button:last-child {
  margin-bottom: calc(3px * var(--global-ss));
}

/* also non scoped version */
.main-button-bar-wrapper > .closer {
  margin-top: 0;
  margin-bottom: 0;
}

/* main-wrapper */

.main-wrapper {
  contain: paint layout;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.landscape .main-wrapper {
  flex-direction: row;
  justify-content: unset;
}

/* main-queue */

.main-queue-container {
  contain: layout paint;
  position: relative;
  margin-top: calc(4px * var(--global-ss));
  margin-bottom: calc(0px * var(--global-ss));
  flex-grow: 1;
  width: calc(238px * var(--global-ss));
  max-width: calc(238px * var(--global-ss));
}

.landscape .main-queue-container {
  margin-right: calc(2px * var(--global-ss));
  margin-bottom: calc(4px * var(--global-ss));
}

.main-queue-wrapper {
  margin-left: 0;
  margin-right: calc(-4px * var(--global-ss));
  /*height: 100%; !*TEST if needed*!*/
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
}

.landscape .main-queue-wrapper {
  margin-right: unset;
}

.main-queue {
  overflow-y: hidden;
  height: 100%;
  margin-left: calc(-1px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
}

.landscape .main-queue {
  margin-left: calc(-2px * var(--global-ss));
  margin-right: calc(-2px * var(--global-ss));
}

/* main-interface */

.main-interface-container {
  max-width: calc(238px * var(--global-ss));
  /*align-self: end;*/
  align-self: stretch;
  display: flex;
}

.landscape .main-interface-container {
  margin-left: calc(2px * var(--global-ss));
}

.main-interface-wrapper {
  /* clips wrapped div that falls outside this one, trough usage of negative margin
 clips a pixel of the main buttons and 2 pixels of the main background plate,
 thus eliminating right borders */
  contain: layout paint;
  margin-left: 0;
  margin-right: calc(-4px * var(--global-ss));
  margin-top: calc(4px * var(--global-ss));
  margin-bottom: calc(4px * var(--global-ss));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.main-interface-bottom {
  display: flex;
  flex-direction: row;
  margin-bottom: calc(1px * var(--global-ss));
}
.keyboard {
  margin-left: calc(1px * var(--global-ss));
  margin-right: calc(2px * var(--global-ss));
  flex-grow: 1;
}
.button-cluster {
  display: inline-block;
  margin: 0 0;
}
.button-cluster-button {
  display: block;
  margin-right: -2px;
  contain: paint;
}
</style>

<style>
.main-button-bar-wrapper > button {
  display: block;
  margin: calc(1px * var(--global-ss)) calc(2px * var(--global-ss));
}

.main-button-bar-wrapper > button:first-child {
  margin-top: calc(3px * var(--global-ss));
}

.main-button-bar-wrapper > button:last-child {
  margin-bottom: calc(3px * var(--global-ss));
}

.main-button-bar-wrapper > .closer {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
