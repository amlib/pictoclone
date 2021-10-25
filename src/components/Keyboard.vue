<template>
  <w-plate normal-tile="main-foreground" :padding="0"
           :notch="[true, true, true, true]">
    <div v-if="layouts[mode]" class="keyboard">
      <template v-for="(section, index) in layouts[mode].sections" :key="index">
        <div :class="section.class">
          <template v-for="key in section.keys" :key="key">
            <w-button :text="key" :class="section.keyClass" :padding="0" no-borders
                      :normal-tile="uniqueKeyTile[key] ? 'keyboard-special' : 'keyboard-normal'"
                      click-tile="keyboard-highlight"
                      icon-prefix-normal="icon-keyboard-normal" icon-prefix-highlight="icon-keyboard-highlight"
                      :icon="uniqueKeyIcon[key] ? key : null" :icon-margin="uniqueKeyIconMargin[key]">
              <div v-if="uniqueKeyIcon[key] == null" :class="uniqueKeyClass[key] ? uniqueKeyClass[key] : 'text'">{{ key }}</div>
            </w-button>
          </template>
        </div>
      </template>
    </div>
  </w-plate>
</template>

<script>
import WPlate from '@/widgets/Plate'
import WButton from '@/widgets/Button'

export default {
  name: 'Keyboard',
  components: { WButton, WPlate },
  props: {
    mode: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      layouts: {
        romaji: {
          sections: [
            {
              class: 'romaji-row1',
              keyClass: 'key-14px',
              keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=']
            },
            {
              class: 'romaji-row2',
              keyClass: 'key-15px',
              keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'backspace']
            },
            {
              class: 'romaji-row2',
              keyClass: 'key-15px',
              keys: ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter']
            },
            {
              class: 'romaji-row4',
              keyClass: 'key-15px',
              keys: ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
            },
            {
              class: 'romaji-row5',
              keyClass: 'key-14px',
              keys: [';', '\'', 'space', '[', ']']
            }
          ]
        }
      },
      uniqueKeyTile: {
        backspace: true,
        enter: true,
        caps: true,
        shift: true,
        space: true
      },
      uniqueKeyIcon: {
        backspace: true,
        enter: true,
        caps: true,
        shift: true,
        space: true
      },
      uniqueKeyIconMargin: {
        backspace: [1, 1, 1, 1],
        enter: [1, 1, 1, 1],
        caps: [1, 1, 1, 1],
        shift: [1, 1, 1, 1],
        space: [1, 29, 1, 29]
      },
      uniqueKeyClass: {
      }
    }
  }
}
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  padding-top: calc(1px * var(--global-ss));
  padding-left: calc(1px * var(--global-ss));
  padding-right: calc(2px * var(--global-ss));
  padding-bottom: calc(1px * var(--global-ss));
}

.romaji-row1 {
  display: flex;
  flex-direction: row;
  margin-left: calc(3px * var(--global-ss))
}
.romaji-row2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.romaji-row4 {
  display: flex;
  flex-direction: row;
}
.romaji-row5 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-left: calc(12px * var(--global-ss))
}

.key-14px {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(14px * var(--global-ss));
  margin-top: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
}

.key-15px {
  min-width: calc(15px * var(--global-ss));
  min-height: calc(15px * var(--global-ss));
  margin-top: calc(1px * var(--global-ss));
  margin-left: calc(1px * var(--global-ss));
}

.text {
  line-height: calc(14px * var(--global-ss));
}
/*.key-caps {*/
/*  line-height: calc(14px * var(--global-ss));*/
/*  font-size: calc(6px * var(--global-ss));*/
/*  font-weight: bold;*/
/*}*/
</style>
