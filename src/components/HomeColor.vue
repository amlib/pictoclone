<template>
  <div :class="['main', faded ? 'main-fade' : '']" :style="mainStyle" @transitionend.self="mainTransitionEnd">
    <w-plate class="colors-window" tile-name="thin-frame" :padding="2">
      <div class="window-colors-content">
        <div class="selected-color-box" :style="selectedColorBoxStyle" @transitionend.stop="colorBoxTransitionEnd"/>
        <template v-for="(row, rowIndex) in colorsRows" :key="rowIndex">
          <div class="color-row">
            <template v-for="(color, cIndex) in colors.filter((c, i) => Math.floor(i / colorsPerRow) === rowIndex)" :key="cIndex">
              <div class="color-frame color-frame-margin"
                   :ref="(el) => setColorRef(el, rowIndex * colorsPerRow + cIndex)"
                   :style="{ backgroundColor: color, visibility: this.colorSwatchDisplay[rowIndex * colorsPerRow + cIndex] ? undefined : 'hidden' }"
                   @click="setColorIndex(rowIndex * colorsPerRow + cIndex)"/>
            </template>
          </div>
        </template>
      </div>
    </w-plate>
    <w-plate class="selected-color-window" tile-name="thin-frame" :padding="2">
      <div class="window-header">Selected</div>
      <div class="window-content">
        <div class="color-frame-big color-frame-big-margin" :style="selectedColorStyle"></div>
      </div>
    </w-plate>
  </div>
</template>

<script>
import WPlate from '/src/widgets/Plate.vue'
import { asyncSetTimeout } from '/src/js/Utils'
import { colorsHex } from '/src/js/Colors'

export default {
  name: 'HomeColor',
  components: { WPlate },
  emits: ['color-selected', 'done', 'back'],
  data: function () {
    return {
      colors: colorsHex,
      colorsPerRow: 4,
      selectedColorIndex: 0,
      colorSwatchRefs: [],
      colorSwatchDisplay: [],
      colorBoxPos: { x: 0, y: 0 },
      faded: true
    }
  },
  computed: {
    colorsRows: function () {
      return this.colors.length / this.colorsPerRow
    },
    selectedColorStyle: function () {
      return {
        backgroundColor: this.colors[this.selectedColorIndex]
      }
    },
    selectedColorBoxStyle: function () {
      const obj = {
        borderColor: this.colors[this.selectedColorIndex]
      }

      const x = this.colorBoxPos.x - (this.colorMarginSize / 2 * this.$global.superSample)
      const y = this.colorBoxPos.y - (this.colorMarginSize / 2 * this.$global.superSample)

      obj.left = x + 'px'
      obj.top = y + 'px'

      return obj
    },
    mainStyle: function () {
      return {
        '--color-margin-size': this.colorMarginSize,
        '--color-size': this.colorSize
      }
    }
  },
  created: function () {
    this.colorSwatchDisplayOrder = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 6, 10, 9]
    this.colorMarginSize = 8
    this.colorSize = 16
    this.selectedColorIndex = this.$global.userColorIndex
  },
  mounted: function () {
    this.colorBoxPath = []
    if (this.colorSwatchRefs[this.selectedColorIndex]) {
      this.colorBoxPos.x = this.colorSwatchRefs[this.selectedColorIndex].offsetLeft
      this.colorBoxPos.y = this.colorSwatchRefs[this.selectedColorIndex].offsetTop
    }

    this.mainTransitionEndCallback = () => this.colorSwatchDisplayEffect(this.colorSwatchDisplayOrder, true)
    this.faded = false
  },
  methods: {
    mainTransitionEnd: function (event) {
      // will trigger for both opacity and transform properties, filter it
      if (event.propertyName === 'opacity') {
        if (this.mainTransitionEndCallback) {
          this.mainTransitionEndCallback()
          this.mainTransitionEndCallback = undefined
        }
      }
    },
    colorSwatchDisplayEffect: async function (displayOrder, value) {
      for (let i = 0; i < displayOrder.length; ++i) {
        await asyncSetTimeout(33)
        this.colorSwatchDisplay[displayOrder[i]] = value
      }
    },
    setColorRef: function (el, index) {
      this.colorSwatchRefs[index] = el
    },
    setColorIndex: function (index) {
      this.$global.audio.playProgram('pc-click')
      const currentElement = this.colorSwatchRefs[this.selectedColorIndex]
      const targetElement = this.colorSwatchRefs[index]
      const size = (this.colorSize + this.colorMarginSize * 2) * this.$global.superSample
      this.colorBoxNewPath({ x: currentElement.offsetLeft, y: currentElement.offsetTop }, { x: targetElement.offsetLeft, y: targetElement.offsetTop }, size)
      this.colorBoxRunPath()

      this.selectedColorIndex = index
      this.$emit('color-selected', index)
    },
    colorBoxTransitionEnd: function () {
      // we need to listen to both left and top properties event (they are modified one at a time, never together),
      // so no filtering required
      this.colorBoxRunPath()
    },
    colorBoxNewPath: function (beginPos, endPos, nodeSize) {
      // example values:
      // beginPos = {x: 0, y: 0}
      // endPos = {x: 48, y: 16}
      // nodeSize = 16
      this.colorBoxPath = []
      const xNodes = Math.round(Math.abs(beginPos.x - endPos.x) / nodeSize)
      const yNodes = Math.round(Math.abs(beginPos.y - endPos.y) / nodeSize)
      const currNode = beginPos
      for (let i = 1; i <= xNodes; ++i) {
        currNode.x = currNode.x + (((endPos.x - beginPos.x) / xNodes) * i)
        this.colorBoxPath.push({ x: currNode.x, y: currNode.y })
      }

      for (let i = 1; i <= yNodes; ++i) {
        currNode.y = currNode.y + (((endPos.y - beginPos.y) / yNodes) * i)
        this.colorBoxPath.push({ x: currNode.x, y: currNode.y })
      }
    },
    colorBoxRunPath: function () {
      const path = this.colorBoxPath.shift()
      if (path) {
        this.colorBoxPos = path
      }
    },
    done: async function () {
      await this.colorSwatchDisplayEffect(this.colorSwatchDisplayOrder.reverse(), false)
      this.mainTransitionEndCallback = () => this.$emit('done')
      this.faded = true
    },
    back: async function () {
      await this.colorSwatchDisplayEffect(this.colorSwatchDisplayOrder.reverse(), false)
      this.mainTransitionEndCallback = () => this.$emit('back')
      this.faded = true
    }
  }
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: calc(7px * var(--global-ss));
  transition: opacity 0.25s linear, transform 0.25s linear;
}

.landscape .main {
  justify-content: center;
}

.main-fade {
  opacity: 0;
  transform: translateY(calc(16px * var(--global-ss)));
}

.selected-color-window {
  width: min-content;
  height: min-content;
  display: flex;
  flex-direction: column;
  margin-top: calc(32px * var(--global-ss));
  margin-right: calc(14px * var(--global-ss));
}

.landscape .selected-color-window {
  margin-left: calc(14px * var(--global-ss));
}

.window-header {
  background: linear-gradient(0deg, rgba(251,251,251,1) 0%, rgba(211,211,211,1) 80%, rgba(195,195,195,1) 100%);
  border-bottom: calc(1px * var(--global-ss)) solid #aaaaaa;
  text-align: center;
  line-height:calc(15px * var(--global-ss));
}

.window-content {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  flex-grow: 1;
}

.colors-window {
  display: flex;
  flex-direction: column;
  margin-left: calc(16px * var(--global-ss));
}

.window-colors-content {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-left: calc(7px * var(--global-ss));
  margin-right: calc(7px * var(--global-ss));
  margin-top: calc(-1px * var(--global-ss));
  margin-bottom: calc(-1px * var(--global-ss));
}

.color-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.color-frame-big {
  width: calc(32px * var(--global-ss));
  height: calc(32px * var(--global-ss));
}

.color-frame-big-margin {
  margin: calc(15px * var(--global-ss));
}

.color-frame {
  width: calc(1px * var(--color-size) * var(--global-ss));
  height: calc(1px * var(--color-size) * var(--global-ss));
  /*position: relative;*/
}

.color-frame-margin {
  margin: calc(1px * var(--color-margin-size) * var(--global-ss));
}

.selected-color-box {
  position: absolute;
  /*inset: calc(-4px * var(--global-ss));*/
  border: dashed calc(1px * var(--global-ss));
  width: calc(1px * (var(--color-size) + var(--color-margin-size)) * var(--global-ss));
  height: calc(1px * (var(--color-size) + var(--color-margin-size)) * var(--global-ss));
  box-sizing: border-box;
  transition-timing-function: linear;
  transition: top 0.05s, left 0.05s;
}
</style>
