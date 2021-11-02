<template>
  <w-plate tile-name="main-background" :stripe-mode=1 stripe-color="#bababa" :padding="0">
    <div class="background">
      <div class="top">
        {{ views[view].topHint }}
      </div>
      <div class="middle" :style="middleStyle" @scroll="onMiddleScrollThrottled" ref="middle">
        <div v-show="scrollUpIndicator || scrollDownIndicator" :class="['scroll-indicator', scrollUpIndicator ? 'scroll-up-indicator' : 'scroll-down-indicator']" :style="getIndicatorStyle"/>
        <component :is="views[view].component" ref="component"
                   @done="onDoneCompleted" @back="onBackCompleted"
                   @color-selected="colorSelected" @name-selected="nameSelected"/>
      </div>
      <div class="bottom">
        <w-button class="text-button" :plate-padding="3"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="onBackThrottled">
          Back
        </w-button>
        <w-button class="text-button" :plate-padding="3"
                  normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                  @click="onDoneThrottled">
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
import { throttle } from 'lodash'

const views = {
  name: {
    component: shallowRef(defineAsyncComponent(() => import('@/components/HomeName'))),
    topHint: 'Please choose a name'
  },
  color: {
    component: shallowRef(defineAsyncComponent(() => import('@/components/HomeColor'))),
    topHint: 'Please select a color'
  },
  options: {
    component: shallowRef(defineAsyncComponent(() => import('@/components/HomeOptions'))),
    topHint: 'Please customize the experience'
  }
}

export default {
  name: 'Home',
  components: { WPlate, WButton },
  data: function () {
    return {
      view: undefined,
      views,
      onBackThrottled: undefined,
      onDoneThrottled: undefined,
      scrollUpIndicator: false,
      scrollDownIndicator: false
    }
  },
  computed: {
    middleStyle: function () {
      const obj = {}
      const tile = this.$tileMap('grid-background-blank')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    getIndicatorStyle: function () {
      const obj = {}
      let tile

      if (this.scrollUpIndicator) {
        tile = this.$tileMap('icon-normal-arrow-up')
      } else if (this.scrollDownIndicator) {
        tile = this.$tileMap('icon-normal-arrow-down')
      }

      if (tile) {
        obj.backgroundImage = `url(${tile.url})`
      }

      return obj
    }
  },
  created: function () {
    this.view = 'options'
  },
  mounted: function () {
    this.onBackThrottled = throttle(this.onBack, 666, { leading: true })
    this.onDoneThrottled = throttle(this.onDone, 666, { leading: true })
    this.onMiddleScrollThrottled = throttle(this.onMiddleScroll, 333, { leading: true, trailing: true })
    this.viewObserver = new ResizeObserver(this.checkComponentSize).observe(this.$refs.middle)
    setTimeout(this.checkComponentSize, 66)
  },
  beforeUnmount: function () {
    if (this.viewObserver) {
      this.viewObserver.unobserve(this.$refs.middle)
    }

    this.onBackThrottled.cancel()
    this.onBackThrottled = undefined
    this.onDoneThrottled.cancel()
    this.onDoneThrottled = undefined
    this.onMiddleScrollThrottled.cancel()
    this.onMiddleScrollThrottled = undefined
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
      if (this.view === 'name') {
        this.view = 'color'
      } else if (this.view === 'color') {
        this.view = 'options'
      } else if (this.view === 'options') {
        this.view = 'name'
      }
      setTimeout(this.checkComponentSize, 120)
    },
    onBackCompleted: function () {
      if (this.view === 'name') {
        this.view = 'options'
      } else if (this.view === 'color') {
        this.view = 'name'
      } else if (this.view === 'options') {
        this.view = 'color'
      }
      setTimeout(this.checkComponentSize, 120)
    },
    checkComponentSize: function () {
      const element = this.$refs.middle
      console.log('checkComponentSize', element.scrollHeight, element.offsetHeight)
      if (element.scrollHeight - element.offsetHeight !== 0) {
        this.scrollUpIndicator = false
        this.scrollDownIndicator = true
      } else {
        this.scrollUpIndicator = false
        this.scrollDownIndicator = false
      }
    },
    onMiddleScroll: function (event) {
      if (event.target.scrollHeight - event.target.offsetHeight !== 0) {
        if (event.target.scrollTop > 0) {
          this.scrollUpIndicator = true
          this.scrollDownIndicator = false
        } else {
          this.scrollUpIndicator = false
          this.scrollDownIndicator = true
        }
      }
      console.log(event.target.scrollTop, event.target.scrollHeight, event.target.offsetHeight)
    }
  }
}
</script>

<style>
.background {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.landscape .background {
  min-width: calc(512px * var(--global-ss));
}

.portrait .background {
  min-width: calc(256px * var(--global-ss));
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
  overflow: auto;
  position: relative;
  scrollbar-width: none; /* hides scrollbar on mozilla */
}

/* hides scrollbar on chrome/webkit */
.middle::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.scroll-indicator {
  width: calc(14px * var(--global-ss));
  height: calc(11px * var(--global-ss));
  background-repeat: no-repeat;
  background-position: center;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
}

.scroll-up-indicator {
  margin-left: auto;
  top: 0;
  position: sticky;
  margin-bottom: -40px;
  animation-name: highlight-up;
}

.scroll-down-indicator {
  bottom: 0;
  right: 0;
  position: absolute;
  animation-name: highlight-down;
}

@keyframes highlight-up {
  from {
    opacity: 1.0;
    transform: translateY(calc(8px * var(--global-ss)));
  }
  to {
    opacity: 0.5;
  }
}

@keyframes highlight-down {
  from {
    opacity: 1.0;
    transform: translateY(calc(-8px * var(--global-ss)));
  }
  to {
    opacity: 0.5;
  }
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
