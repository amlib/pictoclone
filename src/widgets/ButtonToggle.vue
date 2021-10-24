<template>
  <div>
    <!-- must have at least name field in each obj of options array -->
    <template v-for="(item, index) in options" :key="item.name">
      <w-button v-bind="item" @click="onClick(item, index)" :toggled="internalValue === item.name">
        <slot :name="item.name"></slot>
      </w-button>
    </template>
  </div>
</template>

<script>
import WButton from '@/widgets/Button'
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
    }
  }
}
</script>

<style scoped>

</style>
