<template>
  <div class="main">
    <div class="main-button-bar">
      <div class="main-button-bar-wrapper">
        <w-button class="closer" icon="arrow-up" simple :padding="0"/>
        <w-button class="closer" icon="arrow-down" simple :padding="0"/>
      </div>
      <div class="separator"></div>
      <div class="main-button-bar-wrapper">
        <w-button class="closer" icon="brush" simple/>
        <w-button class="closer" icon="eraser" simple/>
      </div>
      <div class="main-button-bar-wrapper">
        <w-button class="closer" icon="brush-big" simple/>
        <w-button class="closer" icon="brush-small" simple/>
      </div>
      <div class="separator"></div>
      <div class="main-button-bar-wrapper">
        <w-button icon="romaji" simple notch-t-l/>
        <w-button icon="accents" simple notch-t-l/>
        <w-button icon="kana" simple notch-t-l/>
        <w-button icon="symbols1" simple notch-t-l/>
        <w-button icon="symbols2" simple notch-t-l/>
      </div>
    </div>
    <div class="main-background-wrapper">
      <w-plate class="main-background" normal-tile="main-background"
               notch-t-l notch-b-l :padding="6"
               :stripe-mode=1 stripe-color="#bababa">
        <w-plate class="test2" normal-tile="main-inverted"
                 notch-b-l notch-b-r notch-t-l notch-t-r>
          Welcome to PICTOCLONE ☸
        </w-plate>
        <w-plate class="test2" normal-tile="main-inverted"
                 notch-b-l notch-b-r notch-t-l notch-t-r/>
        <w-plate class="drawing-area" normal-tile="main-drawing-area"
                 notch-b-l notch-b-r notch-t-l notch-t-r
                 stripe-color="#fbbaba" :stripe-mode=2 :color-hue-deg="220">
          <w-plate class="drawing-area-user-tag" normal-tile="main-color-background"
                   notch-t-l notch-b-r>
            <div>user...</div>
          </w-plate>
        </w-plate>
        <div class="main-background-bottom">
          <w-plate class="keyboard" normal-tile="main-foreground"
                   notch-b-l notch-b-r notch-t-l notch-t-r>
            keyboard goes here...
          </w-plate>
          <div class="button-cluster">
            <w-button class="button-cluster-button" icon="send" notch-t-l :padding="6"/>
            <w-button class="button-cluster-button" icon="copy" style="margin: -2px 0;"/>
            <w-button class="button-cluster-button" icon="clear" notch-b-l/>
          </div>
        </div>
      </w-plate>
    </div>
  </div>
</template>

<script>
import WButton from '@/widgets/Button'
import WPlate from '@/widgets/Plate'
export default {
  name: 'Chat',
  components: { WPlate, WButton }
}
</script>

<style scoped>
.test2 {
  display: block;
  color: white;
  margin: 2px;
  min-height: 24px;
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
  row-gap: 2px;
}

.main-button-bar > .separator {
  height: 2px;
  background-image: linear-gradient(90deg, #ffffff 25%, #494949 25%, #494949 50%, #ffffff 50%, #ffffff 75%, #494949 75%, #494949 100%);
  background-size: 8px 8px;
}

.main-button-bar-wrapper > button {
  display: block;
  margin: 2px 4px;
}

.main-button-bar-wrapper > button:first-child {
  margin-top: 6px;
}
.main-button-bar-wrapper > button:last-child {
  margin-bottom: 6px;
}

.main-button-bar-wrapper > .closer {
  margin: 0;
}

.main-background-wrapper {
  contain: content; /* clips wrapped div that falls outside this one (trough usage of negative margin) */
}

.main-background {
  min-width: 300px;
  min-height: 24px;
  color: white;
  margin-left: 0;
  margin-right: -8px;
  margin-top: 24px;
  margin-bottom: 8px;
}

.drawing-area {
  height: 154px;
  color: white;
  margin-top: 2px;
  margin-bottom: 6px;
  margin-right: 4px;
  position: relative;
  display: block;
}

.drawing-area-user-tag {
  position: absolute;
  left: 0;
  top: 0;
  padding: 0 4px;
  color: red;
}

.main-background-bottom {
  display: flex;
  flex-direction: row;
  margin-bottom: 2px;
}
.keyboard {
  margin-left: 2px;
  margin-right: 4px;
  color: black;
}
.button-cluster {
  display: inline-block;
  margin: 0 0;
}

.button-cluster-button {
  display: block;
}
</style>
