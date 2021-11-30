<template>
  <div :class="['main', faded && 'main-fade']" @transitionend.self="mainTransitionEnd">
    <div class="code-field">
      <w-text-input v-model="serverAddress" ref="text-input" :chars="maxChars" :lines="3"/>
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
  </div>
</template>

<script>
import Keyboard from '/src/components/Keyboard.vue'
import WButtonToggle from '/src/widgets/ButtonToggle.vue'
import WTextInput from '/src/widgets/TextInput.vue'
import WButton from '../widgets/Button.vue'

export default {
  name: 'HomeCustomServer',
  components: { WButton, WTextInput, WButtonToggle, Keyboard },
  emits: ['done', 'back'],
  data: function () {
    return {
      keyboardMode: 'romaji',
      faded: true,
      loading: false,
      serverAddress: '',
      maxChars: 14 * 3
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
    this.serverAddress = this.$global.serverAddress
    setTimeout(() => { this.faded = false }, 16)
  },
  methods: {
    testChange: async function (callback) {
      try {
        this.loading = true
        const chatClient = this.$global.chatClient

        if (chatClient.connected) {
          await chatClient.endConnection()
        }

        await chatClient.startConnection(this.serverAddress)

        this.$global.serverAddress = this.serverAddress
        this.loading = false
        callback()
      } catch (e) {
        import.meta.env.DEV && console.warn(e)
        this.$refs['text-input'].deny()
        this.loading = false
      }
    },
    keyPress: function (key) {
      if (this.specialKeys[key]) {
        this.specialKeys[key](key)
      } else {
        if (this.serverAddress.length < this.maxChars) {
          this.serverAddress += key
        } else {
          this.$refs['text-input'].deny()
        }
      }
    },
    swapChar: function (char) {
      if (this.serverAddress.length >= 0) {
        this.serverAddress = this.serverAddress.substring(0, this.serverAddress.length - 1) + char
      }
    },
    keyPressBackspace: function () {
      if (this.serverAddress.length > 0) {
        this.serverAddress = this.serverAddress.substring(0, this.serverAddress.length - 1)
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
      if (this.serverAddress.length <= 0) {
        this.$refs['text-input'].deny()
        return
      }

      this.testChange(() => {
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
  position: sticky;
  bottom: 0;
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
  padding-bottom:  calc(1px * var(--global-ss));
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

.spacer {
  width: calc(32px * var(--global-ss));
  height: calc(16px * var(--global-ss));
}

.dismiss-button {
  margin-top: calc(12px * var(--global-ss));
  width: calc(96px * var(--global-ss));
}
</style>
