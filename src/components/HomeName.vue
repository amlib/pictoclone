<template>
  <div :class="['main', faded && 'main-fade']" @transitionend.self="mainTransitionEnd">
    <w-text-input v-model="userName" class="name-field" ref="text-input"/>
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
  name: 'HomeName',
  components: { WTextInput, WButtonToggle, Keyboard },
  emits: ['name-selected', 'done', 'back'],
  data: function () {
    return {
      keyboardMode: 'romaji',
      userName: '',
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
    this.userName = this.$global.userName
    setTimeout(() => { this.faded = false }, 16)
  },
  methods: {
    keyPress: function (key) {
      if (this.specialKeys[key]) {
        this.specialKeys[key](key)
      } else {
        if (this.userName.length < 10) {
          this.userName += key
        }
      }
    },
    swapChar: function (char) {
      if (this.userName.length >= 0) {
        this.userName = this.userName.substring(0, this.userName.length - 1) + char
      }
    },
    keyPressBackspace: function () {
      if (this.userName.length > 0) {
        this.userName = this.userName.substring(0, this.userName.length - 1)
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
      if (this.userName.length <= 0) {
        this.$refs['text-input'].deny()
        return
      }
      this.$emit('name-selected', this.userName)
      this.mainTransitionEndCallback = () => { this.$emit('done') }
      this.faded = true
    },
    back: async function () {
      this.$emit('back')
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
