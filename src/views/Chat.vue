<template>
  <div class="main">
    <div class="button-bar">
      <div class="button-bar-wrapper">
        <w-button class="closer" icon="arrow-up" :padding="0" no-borders @click="onScrollUp"/>
        <w-button class="closer" icon="arrow-down" :padding="0" no-borders @click="onScrollDown"/>
      </div>
      <div class="separator landscape-hide"></div>
      <w-button-toggle v-model="selectedTool" class="button-bar-wrapper landscape-hide"
      :common-options="{ class: 'closer', 'no-borders': true }"
      :options="[
        { icon: 'brush', name: 'brush' },
        { icon: 'eraser', name: 'eraser' }]">
      </w-button-toggle>
      <w-button-toggle v-model="brushSize" class="button-bar-wrapper landscape-hide"
        :common-options="{ class: 'closer', 'no-borders': true }"
        :options="[
        { icon: 'brush-big', name: 'brush-big' },
        { icon: 'brush-small', name: 'brush-small' }]">
      </w-button-toggle>
      <div class="separator landscape-hide"></div>
      <w-button-toggle v-model="keyboardMode" class="button-bar-wrapper landscape-hide"
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
          <chat-queue ref="queue"/>
        </w-plate>
      </div>
      <div class="button-bar portrait-hide">
        <w-button-toggle v-model="selectedTool" class="button-bar-wrapper"
                         :common-options="{ class: 'closer', 'no-borders': true }"
                         :options="[
        { icon: 'brush', name: 'brush' },
        { icon: 'eraser', name: 'eraser' }]">
        </w-button-toggle>
        <w-button-toggle v-model="brushSize" class="button-bar-wrapper"
                         :common-options="{ class: 'closer', 'no-borders': true }"
                         :options="[
        { icon: 'brush-big', name: 'brush-big' },
        { icon: 'brush-small', name: 'brush-small' }]">
        </w-button-toggle>
        <div class="separator"></div>
        <w-button-toggle v-model="keyboardMode" class="button-bar-wrapper"
                         :common-options="{ notch: [true, false, false, false] }"
                         :options="[
        { icon: 'romaji', name: 'romaji' },
        { icon: 'accents', name: 'accents' },
        { icon: 'kana', name: 'kana' },
        { icon: 'symbols1', name: 'symbols1' },
        { icon: 'symbols2', name: 'symbols2' }]">
        </w-button-toggle>
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
                        :notch="[true, false, false, false]" :padding="3"
                        @click="sendMessage"/>
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
import ChatQueue from '@/components/ChatQueue'

const brushSizes = {
  'brush-big': 2,
  'brush-small': 1
}

export default {
  name: 'Chat',
  components: { ChatQueue, Keyboard, Message, WButtonToggle, WPlate, WButton },
  data: function () {
    return {
      keyboardMode: 'romaji',
      selectedTool: 'brush',
      brushSize: 'brush-big'
    }
  },
  created () {
    this.brushSizes = brushSizes
  },
  methods: {
    handleKeyPress: function (key) {
      this.$refs['user-message'].keyPress(key)
    },
    handleSymbolDrag: function (payload) {
      this.$refs['user-message'].symbolDrop(payload)
    },
    onScrollUp: function () {
      this.$refs.queue.onScrollUp()
    },
    onScrollDown: function () {
      this.$refs.queue.onScrollDown()
    },
    sendMessage: function () {
      // fake send
      const entry = {
        type: 'message',
        payload: null
      }
      this.$refs['user-message'].clearDrawing()
      this.$refs.queue.addEntry(entry)
    }
  }
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  background-color: #FBFBFB;
  max-width: max-content;
  height: 100%;
}

.landscape .landscape-hide {
  display: none;
  visibility: collapse;
}

.portrait .portrait-hide {
  display: none;
  visibility: collapse;
}

/* button-bar */

.button-bar {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.button-bar-wrapper {
  display: flex;
  flex-direction: column;
  row-gap: calc(1px * var(--global-ss));
}

.button-bar > .separator {
  min-height: calc(1px * var(--global-ss));
  background-image: linear-gradient(90deg, #ffffff 25%, #494949 25%, #494949 50%, #ffffff 50%, #ffffff 75%, #494949 75%, #494949 100%);
  background-size: calc(4px * var(--global-ss)) calc(4px * var(--global-ss));
}

/* also non scoped version */
.button-bar-wrapper > button {
  display: block;
  margin: calc(1px * var(--global-ss)) calc(2px * var(--global-ss));
}

/* also non scoped version */
.button-bar-wrapper > button:first-child {
  margin-top: calc(3px * var(--global-ss));
}

/* also non scoped version */
.button-bar-wrapper > button:last-child {
  margin-bottom: calc(3px * var(--global-ss));
}

/* also non scoped version */
.button-bar-wrapper > .closer {
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
  margin-top: calc(-4px * var(--global-ss));
  margin-bottom: calc(0px * var(--global-ss));
  flex-grow: 1;
  width: calc(238px * var(--global-ss));
  max-width: calc(238px * var(--global-ss));
}

.landscape .main-queue-container {
  margin-right: calc(2px * var(--global-ss));
  margin-bottom: calc(4px * var(--global-ss));
  margin-top: calc(-4px * var(--global-ss));
}

.main-queue-wrapper {
  margin-left: 0;
  margin-right: calc(-4px * var(--global-ss));
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /*box-sizing: border-box;*/
  display: flex;
  flex-direction: column;
}

.landscape .main-queue-wrapper {
  margin-right: unset;
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
  margin-top: calc(-8px * var(--global-ss));
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
.button-bar-wrapper > button {
  display: block;
  margin: calc(1px * var(--global-ss)) calc(2px * var(--global-ss));
}

.button-bar-wrapper > button:first-child {
  margin-top: calc(3px * var(--global-ss));
}

.button-bar-wrapper > button:last-child {
  margin-bottom: calc(3px * var(--global-ss));
}

.button-bar-wrapper > .closer {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
