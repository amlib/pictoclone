<template>
  <div class="queue" ref="queue" @scroll="onScrollThrottled" @wheel="onWheel"
       @pointerdown="onPointerDown" @pointerup="onPointerUp" @pointermove="onPointerMove" @pointercancel="onPointerCancel">
    <div class="queue-spacer" ref="spacer"></div>
    <template v-for="(entry, index) in queue" :key="index">
      <div>
        <template v-if="entry.type === 'notification'">
          <notification :notification-payload="entry.payload"/>
        </template>
        <template v-else-if="entry.type === 'message'">
          <message-show :message-payload="entry.payload"/>
        </template>
      </div>
    </template>
    <teleport v-if="mounted && attachMiniQueue" :to="attachMiniQueue">
      <template v-for="(entry, index) in queue" :key="index">
        <mini-entry :entry="entry"/>
      </template>
    </teleport>
  </div>
</template>

<script>
import MessageShow from './MessageShow.vue'
import Notification from './Notification.vue'
import { throttle, debounce } from 'lodash'
import MiniEntry from './MiniEntry.vue'

export default {
  name: 'ChatQueue',
  components: { MiniEntry, Notification, MessageShow },
  props: {
    attachMiniQueue: {
      type: String,
      required: false,
      default: null
    }
  },
  data: function () {
    return {
      queue: [],
      mounted: false
    }
  },
  computed: {
  },
  created () {
    this.selectedEntryIndex = this.queue.length - 1 // 0 = first on array/ second on dom (due to spacer not counting)
  },
  mounted: function () {
    this.addEntry({
      type: 'notification',
      payload: {
        text: 'Welcome to PICTOCLONE ☸'
      }
    })

    this.scrollToEntryDebounced = debounce(this.scrollToEntry, 150, { maxWait: 333 })
    this.onScrollThrottled = throttle(this.onScroll, 133, { leading: true, trailing: true })

    this.visibility = {}
    this.pointerX = null
    this.pointerY = null
    this.mounted = true
  },
  beforeUnmount: function () {
    this.mounted = false

    this.scrollToEntryDebounced.cancel()
    this.scrollToEntryDebounced = undefined
    this.onScrollThrottled.cancel()
    this.onScrollThrottled = undefined
  },
  methods: {
    addEntry: function (entry) {
      entry.visible = false
      entry.size = -1
      this.queue.push(entry)
      this.selectedEntryIndex = this.queue.length - 1

      this.$nextTick(() => {
        const children = this.$refs.queue.children
        // image may not be loaded yet thus giving wrong height?
        entry.size = children[children.length - 1].clientHeight
        this.scrollToEntryDebounced(this.selectedEntryIndex)
      })
    },
    getEntryRangeSize: function (startIndex, endIndex) {
      let size = 0
      for (let i = startIndex; i <= endIndex; ++i) {
        size += this.queue[i].size
      }

      return size
    },
    scrollToEntry: function (entryIndex) {
      const size = this.getEntryRangeSize(entryIndex + 1, this.queue.length - 1)
      this.$refs.queue.scrollTo({ top: this.$refs.queue.scrollHeight - this.$refs.queue.clientHeight - size, left: 0, behavior: 'smooth' })
      this.selectedEntryIndex = entryIndex
    },
    getVisibleEntries: function (element) {
      const fromTheBottomPosition = element.scrollHeight - (element.clientHeight + element.scrollTop)
      const toTheTopPosition = element.scrollHeight - element.scrollTop

      let entriesStackFromBottomPosition = 0
      let positionTarget = fromTheBottomPosition
      let bottomIndex = null
      let topIndex = 0

      let index = this.queue.length - 1
      for (; index > 0; --index) {
        entriesStackFromBottomPosition += this.queue[index].size
        if (entriesStackFromBottomPosition > positionTarget) {
          if (bottomIndex == null) {
            bottomIndex = index
            positionTarget = toTheTopPosition
          } else {
            topIndex = index
            break
          }
        }
      }

      if (bottomIndex == null) {
        bottomIndex = 0
      }

      for (let i = 0; i < this.queue.length; ++i) {
        this.queue[i].visible = i >= topIndex && i <= bottomIndex
      }

      // console.log(bottomIndex, topIndex, fromTheBottomPosition, toTheTopPosition, 'sizes:', sizes)
      return {
        bottomIndex,
        topIndex,
        total: bottomIndex - topIndex + 1
      }
    },
    getSelectedMessage: function () {
      const entry = this.queue[this.selectedEntryIndex]
      return (entry && entry.type === 'message') ? entry.payload : null
    },
    onScrollUp: function () {
      if (this.selectedEntryIndex <= 0) {
        this.$global.audio.playProgram('pc-deny')
      } else {
        this.$global.audio.playProgram('pc-scroll')
        this.selectedEntryIndex -= 1
      }

      this.scrollToEntryDebounced(this.selectedEntryIndex)
    },
    onScrollDown: function () {
      if (this.selectedEntryIndex >= this.queue.length - 1) {
        const time = performance.now()
        if (this.previousScrollTime == null || time - this.previousScrollTime > 125) {
          this.$global.audio.playProgram('pc-deny')
          this.previousScrollTime = time
        }
      } else {
        this.$global.audio.playProgram('pc-scroll')
        this.selectedEntryIndex += 1
      }

      this.scrollToEntryDebounced(this.selectedEntryIndex)
    },
    onScroll: function (event) {
      const element = event.target
      this.visibility = this.getVisibleEntries(element)
    },
    onPointerDown: function (event) {
      if (event.buttons & 1) {
        // event.target.releasePointerCapture(event.pointerId)
        this.$refs.queue.setPointerCapture(event.pointerId)
        this.pointerX = event.clientX
        this.pointerY = event.clientY
      }
    },
    onPointerMove: function (event) {
      if (this.pointerX != null) { // pointerX is bing used as a lock (onPointerDown)
        requestAnimationFrame(() => {
          // check it again, by the time RAF executes it may have already been canceled (onPointerUp onPointerCancel)
          if (this.pointerX != null) {
            // const pointerX = event.clientX - this.pointerX
            const pointerY = event.clientY - this.pointerY
            this.$refs.queue.scrollBy({ top: pointerY * -2, left: 0, behavior: 'instant' })

            this.pointerX = event.clientX
            this.pointerY = event.clientY
          }
        })
      }
    },
    onPointerUp: function (event) {
      if (this.pointerX) {
        this.scrollToEntryDebounced(this.visibility.bottomIndex)
        this.$refs.queue.releasePointerCapture(event.pointerId)
      }
      this.pointerX = null
      this.pointerY = null
    },
     onPointerCancel: function (event) {
      if (this.pointerX) {
        this.scrollToEntryDebounced(this.visibility.bottomIndex)
        this.$refs.queue.releasePointerCapture(event.pointerId)
      }
      this.pointerX = null
      this.pointerY = null
    },
    onWheel: function (event) {
      if (event.deltaY > 0) {
        this.onScrollDown()
      } else if (event.deltaY < 0) {
        this.onScrollUp()
      }
    }
  }
}
</script>

<style scoped>
.queue {
  margin-right: calc(2px * var(--global-ss));
  margin-bottom: calc(-1px * var(--global-ss));
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  user-select: none;
  touch-action: none;
  overflow-y: hidden;
  will-change: scroll-position, contents;
  /*scroll-behavior: smooth;*/
  /*overflow-y: auto;*/
  /*scrollbar-width: none; !* hides scrollbar on mozilla *!*/
}

/* hides scrollbar on chrome/webkit */
.queue::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.landscape .queue {
  margin-right: calc(-1px * var(--global-ss));
}

.queue-spacer {
  flex-grow: 1;
  min-height: 100%;
}
</style>
