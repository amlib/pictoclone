<template>
  <div class="background" :style="componentStyle">
    <deco-band v-if="$global.showGithubLink" :size="4" :class="['deco-band', view !== 'name' && 'deco-band-fade']">
      <a href="https://github.com/amlib/pictoclone" target="_blank" class="deco-band-link">Fork-me!</a>
    </deco-band>
    <div class="top">
      {{ views[view].topHint }}
    </div>
    <div class="middle" @scroll="onMiddleScrollThrottled" ref="middle">
      <div class="scroll-up-wrapper">
        <div :class="['scroll-indicator', 'scroll-up-indicator', !scrollUpIndicator && 'scroll-hide']"
             :style="scrollUpStyle"/>
      </div>
      <div class="scroll-down-wrapper">
        <div :class="['scroll-indicator', 'scroll-down-indicator', !scrollDownIndicator && 'scroll-hide']"
             :style="scrollDownStyle"/>
      </div>
      <component :is="views[view].component" ref="component" :style="componentStyle" class="component"
                 @done="onDoneCompleted" @back="onBackCompleted"
                 @color-selected="colorSelected" @name-selected="nameSelected"/>
    </div>
    <div class="bottom">
      <w-button :disabled="!canGoBack" class="text-button" :plate-padding="3"
                normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                @click="onBackThrottled" audio-feedback>
        Back
      </w-button>
      <w-button class="text-button" :plate-padding="3"
                normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted"
                @click="onDoneThrottled" audio-feedback>
        Next
      </w-button>
    </div>
  </div>
</template>

<script>
import WButton from '/src/widgets/Button.vue'
import HomeName from '/src/components/HomeName.vue'
import HomeColor from '/src/components/HomeColor.vue'
import HomeOptions from '/src/components/HomeOptions.vue'

import { shallowRef } from 'vue'
import { throttle } from 'lodash'
import DecoBand from '../widgets/DecoBand.vue'

const views = {
  name: {
    component: shallowRef(HomeName),
    topHint: 'Please choose a name'
  },
  color: {
    component: shallowRef(HomeColor),
    topHint: 'Please select a color'
  },
  options: {
    component: shallowRef(HomeOptions),
    topHint: 'Please customize the experience'
  }
}

export default {
  name: 'Home',
  components: { DecoBand, WButton },
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
    componentStyle: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      const obj = {}
      const tile = this.$tileMap('grid-background-blank')
      obj.backgroundImage = `url(${tile.url})`

      return obj
    },
    scrollUpStyle: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      return {
        backgroundImage: `url(${this.$tileMap('icon-normal-arrow-up').url})`
      }
    },
    scrollDownStyle: function () {
      // eslint-disable-next-line no-unused-expressions
      this.$global.superSample
      return {
        backgroundImage: `url(${this.$tileMap('icon-normal-arrow-down').url})`
      }
    },
    canGoBack: function () {
      return this.view !== 'name'
    }
  },
  created: function () {
    this.view = 'name'
    // throttle definitions moved from mounted to here because they break when building production version in vite (!?)
    this.onBackThrottled = throttle(this.onBack, 666, { leading: true })
    this.onDoneThrottled = throttle(this.onDone, 666, { leading: true })
    this.onMiddleScrollThrottled = throttle(this.onMiddleScroll, 333, { leading: false, trailing: true })
  },
  mounted: function () {
    this.viewObserver = new ResizeObserver(this.onMiddleScrollThrottled).observe(this.$refs.middle)
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
      if (this.view === 'name') {
        return
      }
      this.$refs.component.back()
    },
    goToChat: function () {
      this.$global.audio.playProgram('pc-enter')
      this.$router.replace('/chat')
    },
    onDoneCompleted: function () {
      if (this.view === 'name') {
        this.view = 'color'
      } else if (this.view === 'color') {
        this.view = 'options'
      } else if (this.view === 'options') {
        this.goToChat()
        return
      }

      this.$refs.middle.scrollTo(0, 0)
      this.onMiddleScrollThrottled()
    },
    onBackCompleted: function () {
      if (this.view === 'name') {
        return
      } else if (this.view === 'color') {
        this.view = 'name'
      } else if (this.view === 'options') {
        this.view = 'color'
      }
      setTimeout(this.checkComponentSize, 333)
      this.onMiddleScrollThrottled()
    },
    onMiddleScroll: function () {
      const element = this.$refs.middle
      if (element == null) {
        return
      }

      const scrollSlack = element.scrollHeight - element.offsetHeight
      if (scrollSlack > 3 || scrollSlack < -3) {
        if (element.scrollTop === 0) {
          this.scrollUpIndicator = false
          this.scrollDownIndicator = true
        } else if (Math.round(element.scrollTop) < Math.round(element.scrollHeight - element.offsetHeight)) {
          this.scrollUpIndicator = true
          this.scrollDownIndicator = true
        } else {
          this.scrollUpIndicator = true
          this.scrollDownIndicator = false
        }
      } else {
        this.scrollUpIndicator = false
        this.scrollDownIndicator = false
      }
    }
  }
}
</script>

<style>
.background {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow-x: hidden;
}

.landscape .background {
  min-width: calc(512px * var(--global-ss));
}

.portrait .background {
  min-width: calc(256px * var(--global-ss));
}

.top {
  background: linear-gradient(180deg, var(--global-cfaded) 0%, 55%, var(--global-cmain) 90%, var(--global-cmain) 100%);
  padding: calc(6px * var(--global-ss));
  border-bottom: calc(1px * var(--global-ss)) solid black;
  text-align: center;
}

.middle {
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

.component {
  background-position: 0 calc(7px * var(--global-ss));
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
  transition: filter 0.1s;
  position: absolute;
}

.scroll-up-wrapper {
  top: 0;
  position: sticky;
}

.scroll-up-indicator {
  right: 0;
  animation-name: highlight-up;
}

.scroll-down-wrapper {
  top: 100%;
  position: sticky;
}

.scroll-down-indicator {
  right: 0;
  bottom: 0;
  animation-name: highlight-down;
}

.scroll-hide {
  filter: opacity(0);
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
  background: linear-gradient(0deg, var(--global-cfaded) 0%, 55%, var(--global-cmain) 90%, var(--global-cmain) 100%);
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

.rendering-pixel .background {
  image-rendering: pixelated;
}
.rendering-quality .background {
  image-rendering: smooth;
}

.deco-band {
  transition: opacity 0.2s ease-in-out, transform  0.3s ease-in-out;
}

.deco-band-fade {
  opacity: 0.0;
  transform: translateY(-100px) translateX(100px);
}

.deco-band-link {
  color: white;
  text-decoration: none;
}
</style>
