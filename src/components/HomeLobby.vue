<template>
  <div :class="['main', faded && 'main-fade']" @transitionend.self="mainTransitionEnd">
    <w-text-input v-model="roomCode" class="name-field" ref="text-input"/>
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
  </div>
</template>

<script>
import Keyboard from '/src/components/Keyboard.vue'
import WButtonToggle from '/src/widgets/ButtonToggle.vue'
import WTextInput from '/src/widgets/TextInput.vue'

export default {
  name: 'HomeLobby',
  components: { WTextInput, WButtonToggle, Keyboard },
  emits: ['done', 'back'],
  data: function () {
    return {
      keyboardMode: 'romaji',
      roomCode: '',
      faded: true
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
    this.roomCode = ''
    setTimeout(() => { this.faded = false }, 16)
  },
  methods: {
    connectRoom: async function (onSuccess) {
      try {
        const chatClient = this.$global.chatClient

        if (!chatClient.connected) {
          await chatClient.startConnection(() => {
            import.meta.env.DEV && console.log('outside: connection opened')
          }, () => {
            import.meta.env.DEV && console.log('outside: connection closed')
          })
        }

        if (chatClient.roomConnected) {
          // TODO disconnect from room
        }
        // TODO remove usage of Number()
        await chatClient.sendConnectRoom(Number(this.roomCode), this.$global.userName, this.$global.userColorIndex)
        onSuccess()
      } catch (e) {
        console.log('general failure:', e)
        // TODO you know what to TODO
        // if (e.name === messageTypesStr('')) {
        //
        // }
      }
    },
    keyPress: function (key) {
      if (this.specialKeys[key]) {
        this.specialKeys[key](key)
      } else {
        if (this.roomCode.length < 10) {
          this.roomCode += key
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

      // TODO check room code here

      this.connectRoom(() => {
        this.mainTransitionEndCallback = () => { this.$emit('done') }
        this.faded = true
      })
    },
    back: async function () {
      this.mainTransitionEndCallback = () => { this.$emit('back') }
      this.faded = true
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

.name-field {
  padding-top:  calc(23px * var(--global-ss));
  padding-bottom:  calc(10px * var(--global-ss));
}
</style>
