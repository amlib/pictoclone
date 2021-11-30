<template>
  <div class="main">
    <div class="button-bar">
      <div :class="['button-bar-wrapper', 'global-color-hue-tint', $global.rgbMode && 'global-rgb']" :style="rgbStyle">
        <w-button :plate-padding="0" class="more-button"
                  normal-tile="beveled-button" active-tile="beveled-button-highlight"
                  @click="onClose" audio-feedback>
          ✖
        </w-button>
        <w-button :plate-padding="0" class="more-button"
                  normal-tile="beveled-button" active-tile="beveled-button-highlight"
                  @click="toggleFullscreen" audio-feedback>
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
      <div v-if="fun" class="button-bar-wrapper" :class="[$global.rgbMode && 'global-rgb']" :style="rgbStyle">
        <w-button class="rainbow-button"
                  @click="toggleRainbow" :toggled="$global.rgbMode" audio-feedback>
          <div class="rainbow-button">{{ $global.rgbMode ? '☸' : '☺' }}</div>
        </w-button>
      </div>
      <div ref="buttons-mount-portrait" :class="[$global.rgbMode && 'global-rgb']" :style="rgbStyle"></div>
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
        <div ref="buttons-mount-landscape" :class="[$global.rgbMode && 'global-rgb']" :style="rgbStyle"></div>
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
            <keyboard class="keyboard" :mode="keyboardMode" :class="[$global.rgbMode && 'global-rgb']" :style="rgbStyle"
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
      <w-button-toggle v-model="selectedTool" class="button-bar-wrapper"
                       :common-options="{ class: 'closer', 'normal-class': 'simple-button-normal', 'active-class': 'simple-button-active', iconMargin: [1, 1] }"
                       :click-callbacks="toolClickCallbacks"
                       :options="[
        { icon: 'bucket', name: 'flood' },
        { icon: 'brush', name: 'brush' },
        { icon: 'eraser', name: 'eraser' }]">
      </w-button-toggle>
      <w-button-toggle v-model="brushSize" class="button-bar-wrapper"
                       :common-options="{ class: 'closer', 'normal-class': 'simple-button-normal', 'active-class': 'simple-button-active', iconMargin: [1, 1] }"
                       :click-callbacks="sizeClickCallbacks"
                       :options="[
        { icon: 'brush-bigger', name: 'brush-bigger' },
        { icon: 'brush-big', name: 'brush-big' },
        { icon: 'brush-small', name: 'brush-small' }]">
      </w-button-toggle>
      <div class="separator"></div>
      <w-button-toggle v-model="keyboardMode" class="button-bar-wrapper"
                       :common-options="{ class: 'keyboard-buttons', 'plate-notch': [true, false, false, false], 'normal-tile': 'small-button', 'active-tile': 'small-button-highlight', 'plate-padding': 1 }"
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
  'brush-bigger': 5,
  'brush-big': 2,
  'brush-small': 1
}

import { ChatClient } from '../chat'
import { getPngDimensions } from '../js/Utils'

export default {
  name: 'Chat',
  components: { MessageDraw, ChatQueue, Keyboard, WButtonToggle, WPlate, WButton },
  props: {
    roomCode: {
      type: String,
      required: false,
      default: null
    }
  },
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
      () => { this.$global.audio.playProgram('pc-flood') },
      () => { this.$global.audio.playProgram('pc-pen') },
      () => { this.$global.audio.playProgram('pc-eraser') }
    ]
    this.sizeClickCallbacks = [
      () => { this.$global.audio.playProgram('pc-brushbigger') },
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
    const chatClient = this.$global.chatClient

    if (this.roomCode == null) {
      console.log('no room code!')
    }

    this.connect()
  },
  beforeUnmount: function () {
    this.mounted = false
    const chatClient = this.$global.chatClient
    // TODO use leve room instead
    chatClient.connected && chatClient.endConnection()

    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  },
  computed: {
    rgbStyle: function () {
      const obj = {}

      if (this.$global.rgbMode) {
        obj.filter = `hue-rotate(${this.$global.rgbColorHueDeg}deg)`
      }

      return obj
    }
  },
  methods: {
    connect: async function () {
      try {
        const chatClient = this.$global.chatClient
        if (!chatClient.connected) {
          await chatClient.startConnection(this.$global.serverAddress)
        }

        if (!chatClient.roomConnected) {
          await chatClient.sendConnectRoom(Number(this.roomCode), this.$global.userName, this.$global.userColorIndex)
        }

        this.restoreChatHandlers()
      } catch (e) {
        // TODO handle
        console.log('general failure:', e)
      }
    },
    restoreChatHandlers: function () {
      const chatClient = this.$global.chatClient

      chatClient.onOpenCallback = () => {
        console.log('re-connected!!')
        // TODO do something when re-connected?
      }
      chatClient.onCloseCallback = () => {
        console.log('disconnected!!')
        // TODO do something when disconnected
      }
      chatClient.onReceiveChatMessages = this.handleReceiveChatMessages
    },
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
    handleReceiveChatMessages: function (newMessages) {
      import.meta.env.DEV && console.log('got new messages!', newMessages)

      for (let i = 0; i < newMessages.length; ++i) {
        const message = newMessages[i]
        const pngDimensions = getPngDimensions(message.image)
        if (pngDimensions == null) {
          console.warn('discarding malformed message')
          continue
        }

        if (pngDimensions.width > messageWidth || pngDimensions > messageHeight) {
          console.warn('discarding malformed message')
          continue
        }

        const blob = new Blob([message.image], { type: 'image/png' })

        const entry = {
          type: 'message',
          payload: {
            user: message.userName,
            colorIndex: message.colorIndex,
            width: pngDimensions.width,
            height: pngDimensions.height,
            url: URL.createObjectURL(blob) // TODO revoke!
          }
        }

        this.$refs.queue.addEntry(entry)
      }
    },
    sendMessage: async function () {
      try {
        const payload = await this.$refs['user-message'].getMessage()
        const image = await payload.blob.arrayBuffer()

        await this.$global.chatClient.sendChatMessage({
          text: '',
          image: image,
          timestamp: Date.now()
        })

        payload.blob = undefined
        this.$refs['user-message'].clearDrawing()
        this.$global.audio.playProgram('pc-send')

        const entry = {
          type: 'message',
          payload: payload
        }
        this.$refs.queue.addEntry(entry)
      } catch (e) {
        this.$global.audio.playProgram('pc-deny')
      }
    },
    clearDrawing: function () {
      this.$global.audio.playProgram('pc-clear')
      this.$refs['user-message'].clearDrawing()
    },
    onClose: function () {
      this.$router.replace({
        name: 'Home',
        query: {
          v: 'lobby'
        }
      })
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
/* using scoped classes here to allow buttons generated inside ButtonToggle.vue to inherit these */
.button-bar-wrapper > button:first-child {
  margin-top: calc(2px * var(--global-ss));
}

.button-bar-wrapper > button:last-child {
  margin-bottom: calc(2px * var(--global-ss));
}

.button-bar-wrapper > .closer {
  display: block;
  margin: 0 calc(2px * var(--global-ss));
}

.button-bar-wrapper > .keyboard-buttons {
  margin: calc(1px * var(--global-ss)) calc(2px * var(--global-ss));
}
</style>
