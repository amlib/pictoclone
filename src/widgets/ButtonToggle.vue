<template>
  <div>
    <!-- must have at least name field in each obj of options array -->
    <template v-for="(item, index) in options" :key="item.name">
      <w-button v-bind="{ ...item, ...commonOptions }" @click="onClick(item, index)" :toggled="internalValue === item.name">
        <slot :name="item.name"></slot>
      </w-button>
    </template>
  </div>
</template>

<script>
import WButton from '/src/widgets/Button.vue'
export default {
  name: 'WButtonToggle',
  emits: ['update:modelValue'],
  components: { WButton },
  props: {
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    commonOptions: {
      type: Object,
      required: false,
      default: null
    },
    clickCallbacks: {
      type: Array,
      required: false,
      default: null
    }
  },
  data: function () {
    return {
      internalValue: this.modelValue
    }
  },
  methods: {
    onClick: function (item, index) {
      this.internalValue = item.name
      this.$emit('update:modelValue', item.name)
      if (this.clickCallbacks) {
        this.clickCallbacks[index]()
      }
    }
  }
}
</script>

<style scoped>

</style>
