<template>
  <div class="queue" ref="queue">
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
          <w-plate class="queue-entry" normal-tile="main-drawing-area" style="height: 90px"
                   :stripe-mode="2" stripe-color="#fbbaba"
                   :notch="[true, true, true, true]"/>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import WPlate from '@/widgets/Plate'
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
      queue: demoQueue,
      selectedEntryIndex: demoQueue.length - 1 // 0 = first on array/dom
    }
  },
  computed: {
  },
  mounted: function () {
    this.scrollToEntry(this.selectedEntryIndex)
  },
  methods: {
    getEntryRangeSize: function (startIndex, endIndex) {
      const children = this.$refs.queue.children
      let size = 0
      // always one more because of spacer div
      for (let i = startIndex + 1; i <= endIndex + 1; ++i) {
        size += children[i].clientHeight
      }

      return size
    },
    scrollToEntry: function (entryIndex) {
      const size = this.getEntryRangeSize(entryIndex + 1, this.queue.length - 1)
      this.$refs.queue.scrollTo(0, this.$refs.queue.scrollHeight - this.$refs.queue.clientHeight - size)
      this.selectedEntryIndex = entryIndex
    },
    onScrollUp: function () {
      if (this.selectedEntryIndex <= 0) {
        return
      }

      this.selectedEntryIndex -= 1
      this.scrollToEntry(this.selectedEntryIndex)
    },
    onScrollDown: function () {
      if (this.selectedEntryIndex >= this.queue.length - 1) {
        return
      }

      this.selectedEntryIndex += 1
      this.scrollToEntry(this.selectedEntryIndex)
    },
    addEntry: function (entry) {
      this.queue.push(entry)
      this.selectedEntryIndex = this.queue.length - 1
      this.$nextTick(() => {
        this.scrollToEntry(this.selectedEntryIndex)
      })
    }
  }
}
</script>

<style scoped>
.queue {
  /*overflow-y: auto;*/
  overflow-y: hidden;
  margin-left: calc(-1px * var(--global-ss));
  margin-right: calc(1px * var(--global-ss));
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  scroll-behavior: smooth;
  touch-action: none;
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
