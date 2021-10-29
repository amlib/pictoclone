<template>
  <div class="queue" ref="queue" @scroll="onScrollThrottled">
    <div class="queue-spacer" ref="spacer"></div>
    <template v-for="(entry, index) in queue" :key="index">
      <div>
        <template v-if="entry.type === 'notification'">
          <w-plate class="queue-entry" normal-tile="main-inverted"
                   :notch="[true, true, true, true]">
           {{ entry.payload.text }}
          </w-plate>
        </template>
        <template v-else-if="entry.type === 'message'">
          <w-plate class="queue-entry" normal-tile="main-drawing-area" style="height: calc(30px * var(--global-ss))"
                   :stripe-mode="2"
                   :notch="[true, true, true, true]">
          </w-plate>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import WPlate from '@/widgets/Plate'
import { throttle, debounce } from 'lodash'
export default {
  name: 'ChatQueue',
  components: { WPlate },
  data: function () {
    const demoQueue = [
      {
        type: 'notification',
        payload: {
          text: 'Welcome to PICTOCLONE ☸'
        }
      },
      {
        type: 'message',
        payload: null
      },
      {
        type: 'notification',
        payload: {
          text: 'You want fun ?'
        }
      },
      {
        type: 'notification',
        payload: {
          text: 'Wario gonna show you fun'
        }
      }
    ]
    return {
      queue: demoQueue
    }
  },
  computed: {
  },
  created () {
    this.scrollingTimeStamp = 0
    this.selectedEntryIndex = this.queue.length - 1 // 0 = first on array/ second on dom (due to spacer not counting)
    this.scrolling = false
    this.scrollingUnlockTimeWindow = 600
  },
  mounted: function () {
    this.onScrollThrottled = throttle(this.onScroll, 50, { leading: false, trailing: true })
    this.onUserStopScrollingDebounced = debounce(this.onUserStopScrolling, 200)
    this.scrollToEntry(this.selectedEntryIndex)
  },
  beforeUnmount: function () {
    this.onScrollThrottled.cancel()
    this.onScrollThrottled = undefined
    this.onUserStopScrollingDebounced.cancel()
    this.onUserStopScrollingDebounced = undefined
  },
  methods: {
    getEntrySizes: function () {
      const children = this.$refs.queue.children
      const sizes = []
      // always starts one more because of spacer div
      for (let i = 1; i <= children.length - 1; ++i) {
        sizes[i - 1] = children[i].clientHeight
      }

      return sizes
    },
    getEntryRangeSize: function (startIndex, endIndex) {
      const children = this.$refs.queue.children
      let size = 0
      // always starts one more because of spacer div
      for (let i = startIndex + 1; i <= endIndex + 1; ++i) {
        size += children[i].clientHeight
      }

      return size
    },
    scrollToEntry: function (entryIndex) {
      this.scrolling = true
      const size = this.getEntryRangeSize(entryIndex + 1, this.queue.length - 1)
      this.$refs.queue.scrollTo(0, this.$refs.queue.scrollHeight - this.$refs.queue.clientHeight - size)
      this.selectedEntryIndex = entryIndex
      this.scrollingTimeStamp = Date.now()
    },
    onScrollUp: function () {
      if (this.selectedEntryIndex <= 0) {
        // return
      } else {
        this.selectedEntryIndex -= 1
      }

      this.scrollToEntry(this.selectedEntryIndex)
    },
    onScrollDown: function () {
      if (this.selectedEntryIndex >= this.queue.length - 1) {
        // return
      } else {
        this.selectedEntryIndex += 1
      }

      this.scrollToEntry(this.selectedEntryIndex)
    },
    addEntry: function (entry) {
      this.queue.push(entry)
      this.selectedEntryIndex = this.queue.length - 1
      this.$nextTick(() => {
        this.scrollToEntry(this.selectedEntryIndex)
      })
    },
    onScroll: function (event) {
      // Is there a better way to know if the scroll event was triggered from a user or programmatically (scrollTo)?
      // currently discarding scroll events when time locked by scrollToEntry
      if (this.scrolling) {
        if (Date.now() < (this.scrollingTimeStamp + this.scrollingUnlockTimeWindow)) {
          return
        } else {
          this.scrolling = false
        }
      }

      const element = event.target
      this.onUserStopScrollingDebounced(element)
    },
    onUserStopScrolling: function (element) {
      const fromTheBottomPosition = element.scrollHeight - (element.clientHeight + element.scrollTop)

      const sizes = this.getEntrySizes()
      let entriesStackFromBottomPosition = 0
      let index = sizes.length - 1
      for (; index > 0; --index) {
        entriesStackFromBottomPosition += sizes[index]
        if (entriesStackFromBottomPosition > fromTheBottomPosition) {
          break
        }
      }

      // console.log('selected entry:', index, 'fromTheBottomPosition', fromTheBottomPosition, 'entriesStackFromBottomPosition', entriesStackFromBottomPosition, 'sinzes', sizes)
      this.scrollToEntry(index)
    }
  }
}
</script>

<style scoped>
.queue {
  margin-left: calc(-1px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  scroll-behavior: smooth;
  overflow-y: auto;
  scrollbar-width: none; /* hides scrollbar on mozilla */
}

/* hides scrollbar on chrome/webkit */
.queue::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.landscape .queue {
  margin-left: calc(-2px * var(--global-ss));
  margin-right: calc(-2px * var(--global-ss));
}

.queue-spacer {
  flex-grow: 1;
  min-height: 100%;
}

.queue-entry {
  display: block;
  color: gray;
  margin: calc(1px * var(--global-ss)) calc(1px * var(--global-ss));
  min-height: calc(12px * var(--global-ss));
}

</style>
