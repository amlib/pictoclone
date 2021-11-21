<template>
  <div class="main">
    <div class="button-bar">
      <div class="button-bar-wrapper">
        <w-button :plate-padding="0" class="more-button"
                  normal-tile="beveled-button" active-tile="beveled-button-highlight"
                  @click="onClose" audioFeedback global-tint>
          ✖
        </w-button>
        <w-button :plate-padding="0" class="more-button"
                  normal-tile="beveled-button" active-tile="beveled-button-highlight"
                  @click="toggleFullscreen" audioFeedback global-tint>
          <span style="padding-left: calc(0.5px * var(--global-ss))">↕</span>
        </w-button>
      </div>
      <div class="mini-queue-wrapper">
        <div id="mini-queue" class="mini-queue"/>
      </div>
      <div class="separator"></div>
      <div class="button-bar-wrapper">
        <w-button class="closer" icon="arrow-up" :plate-padding="0"
                  normal-class="simple-button-normal" active-class="simple-button-active"
                  @click="onScrollUp"/>
        <w-button class="closer" icon="arrow-down" :plate-padding="0"
                  normal-class="simple-button-normal" active-class="simple-button-active"
                  @click="onScrollDown"/>
      </div>
      <div class="separator landscape-hide"></div>
      <div ref="buttons-mount-portrait"></div>
    </div>
    <div class="main-wrapper">
      <div class="main-queue-container">
        <w-plate class="main-queue-wrapper" tile-name="main-background"
                 :notch="[true, true, true, true]" :padding="3"
                 :stripe-mode=1 stripe-color="#bababa">
          <chat-queue ref="queue" attach-mini-queue="#mini-queue"/>
        </w-plate>
      </div>
      <div class="button-bar portrait-hide">
        <div ref="buttons-mount-landscape"></div>
      </div>
      <div class="main-interface-container">
        <w-plate class="main-interface-wrapper" tile-name="main-background"
                 :notch="[true, false, false, true]" :padding="3"
                 :stripe-mode=1 stripe-color="#bababa">
          <message-draw :selected-tool="selectedTool"
                   :brush-size="brushSizes[brushSize]"
                   :message-payload="messagePayload"
                   ref="user-message" class="user-message"
                   :rainbow-brush="rainbowBrush" @fun="onFun"/>
          <div class="main-interface-bottom">
            <keyboard class="keyboard" :mode="keyboardMode"
                      @keyboard-key-press="handleKeyPress" @symbol-drag="handleSymbolDrag" @keyboard-swap-char="handleSwapChar"/>
            <div class="button-cluster">
              <w-button class="button-cluster-button" icon="send"
                        normal-tile="main-button" active-tile="main-color-fill"
                        :plate-notch="[true, false, false, false]" :plate-padding="3"
                        @click="sendMessage"/>
              <w-button class="button-cluster-button middle-button" icon="copy"
                        normal-tile="main-button" active-tile="main-color-fill"
                        :plate-padding="4"
                        @click="copySelectedMessage"/>
              <w-button class="button-cluster-button" icon="clear"
                        normal-tile="main-button" active-tile="main-color-fill"
                        :plate-notch="[false, false, false, true]"  :plate-padding="4"
                        @click="clearDrawing"/>
            </div>
          </div>
        </w-plate>
      </div>
    </div>
    <teleport v-if="mounted" :to="$refs[$global.isLandscape ? 'buttons-mount-landscape' : 'buttons-mount-portrait']">
      <div v-if="fun" class="button-bar-wrapper">
        <w-button class="rainbow-button" @click="toggleRainbow" :toggled="this.$global.rgbMode">
          <div class="rainbow-button">{{ this.$global.rgbMode ? '☸' : '☺' }}</div>
        </w-button>
      </div>
      <w-button-toggle v-model="selectedTool" class="button-bar-wrapper"
                       :common-options="{ class: 'closer', 'normal-class': 'simple-button-normal', 'active-class': 'simple-button-active', iconMargin: [1, 1] }"
                       :click-callbacks="toolClickCallbacks"
                       :options="[
        { icon: 'brush', name: 'brush' },
        { icon: 'eraser', name: 'eraser' }]">
      </w-button-toggle>
      <w-button-toggle v-model="brushSize" class="button-bar-wrapper"
                       :common-options="{ class: 'closer', 'normal-class': 'simple-button-normal', 'active-class': 'simple-button-active', iconMargin: [1, 1] }"
                       :click-callbacks="sizeClickCallbacks"
                       :options="[
        { icon: 'brush-big', name: 'brush-big' },
        { icon: 'brush-small', name: 'brush-small' }]">
      </w-button-toggle>
      <div class="separator"></div>
      <w-button-toggle v-model="keyboardMode" class="button-bar-wrapper"
                       :common-options="{ 'plate-notch': [true, false, false, false], 'normal-tile': 'small-button', 'active-tile': 'small-button-highlight', 'plate-padding': 1 }"
                       :click-callbacks="keyboardModeClickCallbacks"
                       :options="[
        { icon: 'romaji', name: 'romaji' },
        { icon: 'accents', name: 'accents' },
        { icon: 'kana', name: 'kana' },
        { icon: 'symbols1', name: 'symbols1' },
        { icon: 'symbols2', name: 'symbols2' }]">
      </w-button-toggle>
    </teleport>
  </div>
</template>

<script>
import WButton from '/src/widgets/Button.vue'
import WPlate from '/src/widgets/Plate.vue'
import WButtonToggle from '/src/widgets/ButtonToggle.vue'
import Keyboard from '/src/components/Keyboard.vue'
import ChatQueue from '/src/components/ChatQueue.vue'
import MessageDraw from '../components/MessageDraw.vue'
import { messageWidth, messageHeight } from '/src/js/Message'

const brushSizes = {
  'brush-big': 2,
  'brush-small': 1
}

export default {
  name: 'Chat',
  components: { MessageDraw, ChatQueue, Keyboard, WButtonToggle, WPlate, WButton },
  data: function () {
    return {
      keyboardMode: 'romaji',
      selectedTool: 'brush',
      brushSize: 'brush-big',
      messagePayload: {
        user: this.$global.userName,
        colorIndex: this.$global.userColorIndex,
        width: messageWidth,
        height: messageHeight
      },
      mounted: false, // is there a better way?
      fun: false,
      rainbowBrush: false
    }
  },
  created () {
    this.brushSizes = brushSizes
    this.toolClickCallbacks = [
      () => { this.$global.audio.playProgram('pc-pen') },
      () => { this.$global.audio.playProgram('pc-eraser') }
    ]
    this.sizeClickCallbacks = [
      () => { this.$global.audio.playProgram('pc-brushbig') },
      () => { this.$global.audio.playProgram('pc-brushsmall') }
    ]
    const click = () => { this.$global.audio.playProgram('pc-click') }
    this.keyboardModeClickCallbacks = [
      click, click, click, click, click // click
    ]
  },
  mounted: function () {
    this.mounted = true
  },
  beforeUnmount: function () {
    this.mounted = false

    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  },
  methods: {
    handleKeyPress: function (key) {
      this.$refs['user-message'].keyPress(key)
    },
    handleSwapChar: function (key) {
      this.$refs['user-message'].swapChar(key)
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
    copySelectedMessage: function () {
      const message = this.$refs.queue.getSelectedMessage()
      if (message) {
        this.$global.audio.playProgram('pc-copy')
        this.$refs['user-message'].pasteFromMessage(message)
      }
    },
    sendMessage: async function () {
      try {
        const payload = await this.$refs['user-message'].getMessage()

        const entry = {
          type: 'message',
          payload: payload
        }

        this.$refs['user-message'].clearDrawing()

        // fake send
        this.$global.audio.playProgram('pc-send')
        this.$refs.queue.addEntry(entry)
      } catch (e) {
        if (e.message === 'empty') {
          this.$global.audio.playProgram('pc-deny')
        }
      }
    },
    clearDrawing: function () {
      this.$global.audio.playProgram('pc-clear')
      this.$refs['user-message'].clearDrawing()
    },
    onClose: function () {
      this.$router.push('/')
    },
    onFun: function () {
      this.$refs.queue.addEntry({
        type: 'notification',
        payload: {
          text: 'You want fun?',
          color: 'global'
        }
      })

      setTimeout(() => {
        this.$refs.queue.addEntry({
          type: 'notification',
          payload: {
            text: 'Wario gonna show you fun',
            color: 'global'
          }
        })

        this.rainbowBrush = true
        this.$global.setRgbMode(true)
        this.fun = true
      }, 1000)
    },
    toggleRainbow: function () {
      const mode = !this.$global.rgbMode
      this.$global.setRgbMode(mode)
      this.rainbowBrush = mode
    },
    toggleFullscreen: function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
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

/* mini-queue */

.mini-queue-wrapper {
  overflow-y: hidden;
  margin-left: calc(2px * var(--global-ss));
  margin-right: calc(2px * var(--global-ss));
  margin-bottom: calc(2px * var(--global-ss));
  position: relative;
  flex-grow: 1;
}

.mini-queue {
  position: absolute;
  bottom: 0;
  left: 0;
  top: auto;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
  background-image: linear-gradient(90deg, #fff 0px, #fff calc(1px * var(--global-ss)), #555 calc(1px * var(--global-ss)), #555 calc(2px * var(--global-ss)));
  background-size: calc(2px * var(--global-ss)) calc(4px * var(--global-ss));
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
  margin-top: calc(2px * var(--global-ss));
  margin-bottom: calc(1px * var(--global-ss));
}
.user-message {
  margin-top: calc(0px * var(--global-ss));
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
.middle-button {
  margin: calc(var(--global-ss) * -1px) 0;
}

.rainbow-button {
  background: var(--global-cl2);
  width: calc(13px * var(--global-ss));
  min-height: calc(13px * var(--global-ss));
  color: white;
  padding-left: calc(0.33px * var(--global-ss));
}

.more-button {
  line-height: calc(15px * var(--global-ss));
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
