<template>
  <div class="background" :style="getStyle">
    <text-input v-model="userName" class="name-field"/>
    <div class="keyboard-wrapper">
      <div class="keyboard-buttons-wrapper">
        <w-button-toggle class="keyboard-buttons-toggle" v-model="keyboardMode"
                         :common-options="{ 'plate-notch': [true, false, false, false], 'normal-tile': 'beveled-button', 'active-tile': 'beveled-button-highlight', 'plate-padding': 2 }"
                         :options="[
        { icon: 'romaji', name: 'romaji' },
        { icon: 'accents', name: 'accents' },
        { icon: 'kana', name: 'kana' },
        { icon: 'symbols1', name: 'symbols1' },
        { icon: 'symbols2', name: 'symbols2' }]">
        </w-button-toggle>
      </div>
      <keyboard class="keyboard" :mode="keyboardMode"
                @keyboard-key-press="keyPress"/>
    </div>
  </div>
</template>

<script>
import Keyboard from '@/components/Keyboard'
import WButtonToggle from '@/widgets/ButtonToggle'
import TextInput from '@/widgets/TextInput'

export default {
  name: 'HomeName',
  components: { TextInput, WButtonToggle, Keyboard },
  data: function () {
    return {
      keyboardMode: 'romaji',
      userName: 'amlib'
    }
  },
  computed: {
    getStyle: function () {
      const obj = {}
      const tile = this.$tileMap('grid-background-blank')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    }
  },
  created: function () {
    const specialKeys = {
      enter: () => {},
      backspace: () => this.keyPressBackspace(),
      space: () => this.keyPress(' '),
      shift: () => {},
      caps: () => {}
    }

    this.specialKeys = specialKeys
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
    keyPressBackspace: function () {
      if (this.userName.length > 0) {
        this.userName = this.userName.substring(0, this.userName.length - 1)
      }
    }
  }
}
</script>

<style scoped>
.plate {
  align-self: center;
}

.background {
  background-position: 0 calc(7px * var(--global-ss));
}

.keyboard-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.keyboard {
  margin-right: calc(15px * var(--global-ss));
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
  margin-top:  calc(7px * var(--global-ss));
  margin-bottom:  calc(15px * var(--global-ss));
}
</style>
