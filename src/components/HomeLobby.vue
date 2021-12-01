<template>
  <div :class="['main', faded && 'main-fade']" @transitionend.self="mainTransitionEnd">
    <div class="code-field">
      <w-text-input v-model="roomCode" ref="text-input"/>
      <div class="buttons">
        <w-button :plate-padding="3" :disabled="loading" class="button"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="createNewRoom" audio-feedback>
          New room
        </w-button>
        <div class="spacer"></div>
        <w-button :plate-padding="3" :disabled="loading" class="button"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="customServer" audio-feedback>
          Custom
        </w-button>
        <div class="spacer"></div>
        <w-button :plate-padding="3" :disabled="loading" class="sm-button"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="copyUrl" audio-feedback>
          ♨
        </w-button>
      </div>
    </div>
    <div class="keyboard-wrapper">
      <div class="keyboard-buttons-wrapper">
        <w-button-toggle class="keyboard-buttons-toggle global-color-hue-tint" v-model="keyboardMode"
                         :common-options="{
          'normal-tile': 'beveled-button',
          'active-tile': 'beveled-button-highlight',
          'plate-padding': 2,
          'audio-feedback': true,
          'icon-prefix-highlight': 'icon-normal' }"
                         :options="[
          { icon: 'romaji', name: 'romaji' },
          { icon: 'accents', name: 'accents' },
          { icon: 'kana', name: 'kana' },
          { icon: 'symbols1', name: 'symbols1' },
          { icon: 'symbols2', name: 'symbols2' }]">
        </w-button-toggle>
      </div>
      <keyboard class="keyboard" :mode="keyboardMode" :symbol-drop="false"
                @keyboard-key-press="keyPress" @keyboard-swap-char="swapChar"/>
    </div>
    <modal-dialog :show="modal" :padding="16">
      <div style="color: white">{{ modalText }}</div>
      <w-button :plate-padding="3" class="dismiss-button"
                normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                @click="modalCallback" audio-feedback>
        {{ modalButtonText }}
      </w-button>
    </modal-dialog>
  </div>
</template>

<script>
import Keyboard from '/src/components/Keyboard.vue'
import WButtonToggle from '/src/widgets/ButtonToggle.vue'
import WTextInput from '/src/widgets/TextInput.vue'
import WButton from '../widgets/Button.vue'
import { errorsStr } from '../chat/specs'
import ModalDialog from '/src/components/ModalDialog.vue'
import { asyncSetTimeout } from '../js/Utils'

export default {
  name: 'HomeLobby',
  components: { ModalDialog, WButton, WTextInput, WButtonToggle, Keyboard },
  emits: ['done', 'back', 'custom-server'],
  data: function () {
    return {
      keyboardMode: 'romaji',
      roomCode: '',
      faded: true,
      loading: false,
      modal: false,
      modalText: '',
      modalButtonText: 'OK',
      modalCallback: null
    }
  },
  computed: {
  },
  created: function () {
    const specialKeys = {
      enter: () => {},
      'small-enter': () => {},
      backspace: () => this.keyPressBackspace(),
      'small-backspace': () => this.keyPressBackspace(),
      space: () => this.keyPress(' '),
      'small-space': () => this.keyPress(' '),
      shift: () => {},
      caps: () => {},
      hiragana: () => {},
      katakana: () => {},
      komoji: () => {}
    }

    this.specialKeys = specialKeys
  },
  mounted: function () {
    this.roomCode = this.$global.roomCode
    setTimeout(() => { this.faded = false }, 16)
    this.failedAttempts = 0
  },
  methods: {
    createNewRoom: async function () {
      try {
        this.loading = true
        const chatClient = this.$global.chatClient

        if (!chatClient.connected) {
          await chatClient.startConnection(this.$global.serverAddress)
        }

        const roomCode = await chatClient.sendCreateRoom()
        this.roomCode = String(roomCode)
        this.loading = false
      } catch (e) {
        if (e.name === 'ERROR_ROOM_DOES_NOT_EXISTS' || e.name === 'ERROR_GENERIC_ERROR') {
          this.failedAttempts += 1
          this.modal = true
          if (this.previousFailedAttemptMessage != null &&
            e.message === this.previousFailedAttemptMessage &&
            (this.failedAttempts > 1 && this.failedAttempts % 2 === 0)) {
            this.modalText = 'Server could be down, or an adblocker may be inhibiting the websocket connection, if so, please disable it for this page and try again'
          } else {
            this.modalText = e.message
            this.previousFailedAttemptMessage = e.message
          }
          this.modalCallback = () => {
            this.modal = false
          }
        } else {
          import.meta.env.DEV && console.log('HomeLobby.connectRoom:', e)
        }
        this.loading = false
      }
    },
    connectRoom: async function (onSuccess) {
      try {
        const chatClient = this.$global.chatClient

        if (!chatClient.connected) {
          await chatClient.startConnection(this.$global.serverAddress)
        }

        if (chatClient.roomConnected) {
          await chatClient.sendLeaveRoom(this.$global.serverAddress)
        }
        await chatClient.sendConnectRoom(Number(this.roomCode), this.$global.userName, this.$global.userColorIndex)

        this.$global.roomCode = this.roomCode
        onSuccess()
      } catch (e) {
        if (e.name === 'ERROR_ROOM_DOES_NOT_EXISTS' || e.name === 'ERROR_GENERIC_ERROR') {
          this.failedAttempts += 1
          this.modal = true
          if (this.previousFailedAttemptMessage != null &&
            e.message === this.previousFailedAttemptMessage &&
            (this.failedAttempts > 1 && this.failedAttempts % 2 === 0)) {
            this.modalText = 'Server could be down, or an adblocker may be inhibiting the websocket connection, if so, please disable it for this page and try again'
          } else {
            this.modalText = e.message
            this.previousFailedAttemptMessage = e.message
          }
          this.modalCallback = () => {
            this.modal = false
          }
        } else {
          import.meta.env.DEV && console.log('HomeLobby.connectRoom:', e)
        }
      }
    },
    keyPress: function (key) {
      if (this.specialKeys[key]) {
        this.specialKeys[key](key)
      } else {
        if (this.roomCode.length < 10) {
          this.roomCode += key
        } else {
          this.$refs['text-input'].deny()
        }
      }
    },
    swapChar: function (char) {
      if (this.roomCode.length >= 0) {
        this.roomCode = this.roomCode.substring(0, this.roomCode.length - 1) + char
      }
    },
    keyPressBackspace: function () {
      if (this.roomCode.length > 0) {
        this.roomCode = this.roomCode.substring(0, this.roomCode.length - 1)
      } else {
        this.$refs['text-input'].deny()
      }
    },
    mainTransitionEnd: function (event) {
      // will trigger for both opacity and transform properties, filter it
      if (event.propertyName === 'opacity') {
        if (this.mainTransitionEndCallback) {
          this.mainTransitionEndCallback()
          this.mainTransitionEndCallback = undefined
        }
      }
    },
    done: async function () {
      if (this.roomCode.length <= 0) {
        this.$refs['text-input'].deny()
        return
      }

      this.connectRoom(() => {
        this.mainTransitionEndCallback = () => { this.$emit('done') }
        this.faded = true
      })
    },
    back: async function () {
      this.mainTransitionEndCallback = () => { this.$emit('back') }
      this.faded = true
    },
    customServer: function () {
      this.mainTransitionEndCallback = () => { this.$emit('custom-server') }
      this.faded = true
    },
    copyUrl: async function () {
      await this.$router.replace({
        name: 'Home',
        query: {
          v: 'lobby',
          r: this.roomCode,
          s: this.$global.serverAddress
        }
      })

      await asyncSetTimeout(100)

      try {
        await navigator.clipboard.writeText(document.URL)
        this.modalText = 'URL with server and room settings copied to the clipboard. Share it for easy access!'
      } catch (e) {
        this.modalText = 'Could not copy URL to the clipboard, try copying it from the address bar and share it for easy access!'
      }

      this.modal = true
      this.modalCallback = () => {
        this.modal = false
      }
    }
  }
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  transition: opacity 0.25s linear, transform 0.25s linear;
}

.main-fade {
  opacity: 0;
  transform: translateY(calc(16px * var(--global-ss)));
}

.keyboard-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: calc(13px * var(--global-ss));
}

.landscape .keyboard-wrapper {
  justify-content: center;
}

.keyboard {
  margin-right: calc(15px * var(--global-ss));
}

.landscape .keyboard {
  justify-content: center;
  margin-left: calc(8px * var(--global-ss));
}

.keyboard-buttons-wrapper {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin-top: calc(1px * var(--global-ss));
  margin-left: calc(16px * var(--global-ss));
}

.keyboard-buttons-toggle {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.code-field {
  padding-top:  calc(7px * var(--global-ss));
  padding-bottom:  calc(6px * var(--global-ss));
  display: flex;
  flex-direction: column;
}

.buttons {
  margin-left: auto;
  margin-right: auto;
  margin-top: calc(7px * var(--global-ss));
  display: flex;
}

.button {
  width: calc(64px * var(--global-ss));
}

.sm-button {
  width: calc(20px * var(--global-ss));
}

.spacer {
  width: calc(16px * var(--global-ss));
  height: calc(16px * var(--global-ss));
}

.dismiss-button {
  margin-top: calc(12px * var(--global-ss));
  width: calc(96px * var(--global-ss));
}
</style>
