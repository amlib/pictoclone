<template>
  <w-plate tile-name="main-background" :stripe-mode=1 stripe-color="#bababa" :padding="0">
    <div class="background">
      <div class="top">
        {{ views[view].topHint }}
      </div>
      <component class="middle" :is="views[view].component" :style="middleStyle" ref="component"
                 @done="onDoneCompleted" @back="onBackCompleted"
                 @color-selected="colorSelected" @name-selected="nameSelected"/>
      <!--    <router-link to="/chat">Chat</router-link>-->
      <div class="bottom">
        <w-button class="text-button" :plate-padding="3"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="onBack">
          Back
        </w-button>
        <w-button class="text-button" :plate-padding="3"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="onDone">
          Confirm
        </w-button>
      </div>
    </div>
  </w-plate>
</template>

<script>
import WButton from '@/widgets/Button'
import WPlate from '@/widgets/Plate'
import { defineAsyncComponent, shallowRef } from 'vue'

const views = {
  name: {
    component: shallowRef(defineAsyncComponent(() => import('@/components/HomeName'))),
    topHint: 'Please choose a name'
  },
  color: {
    component: shallowRef(defineAsyncComponent(() => import('@/components/HomeColor'))),
    topHint: 'Please select a color'
  }
}

export default {
  name: 'Home',
  components: { WPlate, WButton },
  data: function () {
    return {
      view: undefined,
      views
    }
  },
  computed: {
    middleStyle: function () {
      const obj = {}
      const tile = this.$tileMap('grid-background-blank')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    }
  },
  created: function () {
    this.view = 'color'
  },
  mounted: function () {

  },
  methods: {
    nameSelected: function (name) {
      this.$global.userName = name
    },
    colorSelected: function (colorIndex) {
      this.$global.userColorIndex = colorIndex
    },
    onDone: function () {
      this.$refs.component.done()
    },
    onBack: function () {
      this.$refs.component.back()
    },
    onDoneCompleted: function () {
      if (this.view === 'color') {
        this.view = 'name'
      } else if (this.view === 'name') {
        this.view = 'color'
      }
    },
    onBackCompleted: function () {
      if (this.view === 'color') {
        this.view = 'name'
      } else if (this.view === 'name') {
        this.view = 'color'
      }
    }
  }
}
</script>

<style>
.background {
  min-width: calc(256px * var(--global-ss));
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top {
  background: linear-gradient(180deg, var(--global-c2) 0%, 55%, var(--global-c1) 90%, var(--global-c1) 100%);
  padding: calc(6px * var(--global-ss));
  border-bottom: calc(1px * var(--global-ss)) solid black;
  text-align: center;
}

.middle {
  background-position: 0 calc(7px * var(--global-ss));
  height: 100%;
}
.bottom {
  background: linear-gradient(0deg, var(--global-c2) 0%, 55%, var(--global-c1) 90%, var(--global-c1) 100%);
  padding: calc(4px * var(--global-ss));
  border-top: calc(1px * var(--global-ss)) solid black;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.text-button {
  min-width: calc(60px * var(--global-ss));
  /*line-height: calc(20px * var(--global-ss));*/
}
</style>
