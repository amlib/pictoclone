<template>
  <div class="main">
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
      :common-options="{ 'notch-t-l': true }"
      :options="[
        { icon: 'romaji', name: 'romaji' },
        { icon: 'accents', name: 'accents' },
        { icon: 'kana', name: 'kana' },
        { icon: 'symbols1', name: 'symbols1' },
        { icon: 'symbols2', name: 'symbols2' }]">
      </w-button-toggle>
    </div>
    <div class="main-background-wrapper">
      <w-plate class="main-background" normal-tile="main-background"
               notch-t-l notch-b-l :padding="3"
               :stripe-mode=1 stripe-color="#bababa">
        <w-plate class="test2" normal-tile="main-inverted"
                 notch-b-l notch-b-r notch-t-l notch-t-r>
          Welcome to PICTOCLONE ☸
        </w-plate>
        <w-plate class="test2" normal-tile="main-inverted"
                 notch-b-l notch-b-r notch-t-l notch-t-r/>
        <message :selected-tool="selectedTool" :brush-size="brushSizes[brushSize]" ref="user-message"/>
        <div class="main-background-bottom">
          <w-plate class="keyboard" normal-tile="main-foreground"
                   notch-b-l notch-b-r notch-t-l notch-t-r>
            {{ keyboardMode }}
          </w-plate>
          <div class="button-cluster">
            <w-button class="button-cluster-button" icon="send"
                      normal-tile="main-button" click-tile="main-color-fill"
                      notch-t-l :padding="3"/>
            <w-button class="button-cluster-button" icon="copy"
                      normal-tile="main-button" click-tile="main-color-fill"
                      :padding="4" :style="`margin: ${$global.superSample * -1}px 0;`"/>
            <w-button class="button-cluster-button" icon="clear"
                      normal-tile="main-button" click-tile="main-color-fill"
                      notch-b-l  :padding="4"
                      @click="$refs['user-message'].clearDrawing()"/>
          </div>
        </div>
      </w-plate>
    </div>
  </div>
</template>

<script>
import WButton from '@/widgets/Button'
import WPlate from '@/widgets/Plate'
import WButtonToggle from '@/widgets/ButtonToggle'
import Message from '@/components/Message'
export default {
  name: 'Chat',
  components: { Message, WButtonToggle, WPlate, WButton },
  data: function () {
    return {
      keyboardMode: 'romaji',
      selectedTool: 'brush',
      brushSize: 'brush-big',
      brushSizes: {
        'brush-big': 2,
        'brush-small': 1
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>
.test2 {
  display: block;
  color: white;
  margin: calc(1px * var(--global-ss));
  min-height: calc(12px * var(--global-ss));
}

.main {
  display: flex;
  flex-direction: row;
  background-color: #FBFBFB;
  max-width: max-content;
}

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
  height: calc(1px * var(--global-ss));
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

.main-background-wrapper {
  contain: content; /* clips wrapped div that falls outside this one (trough usage of negative margin) */
}

.main-background {
  margin-left: 0;
  margin-right: calc(-4px * var(--global-ss));
  margin-top: calc(12px * var(--global-ss));
  margin-bottom: calc(4px * var(--global-ss));
}

.main-background-bottom {
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
