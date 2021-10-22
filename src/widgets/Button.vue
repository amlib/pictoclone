<template>
  <button>
    <div v-if="icon">{{ icon }}</div>
  </button>
</template>

<script>
export default {
  name: 'WButton',
  emits: ['click'],
  props: {
    icon: {
      type: String,
      required: false,
      default: null
    },
    color: {
      type: String,
      required: false,
      default: 'red'
    },
    border: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
  },
  methods: {
    onClick: function () {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
button::before {
  background-color: red;
  clip-path: polygon(25% 0%, 100% 0, 100% 100%, 0 100%, 0% 25%);
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
button::after {
  image-rendering: pixelated;
  background-color: green;
  clip-path: polygon(25% 0%, 100% 0, 100% 100%, 0 100%, 0% 25%);
  content: '';
  position: absolute;
  z-index: -1;
  top: 2px;
  bottom: 2px;
  left: 2px;
  right: 2px;
}
button {
  image-rendering: pixelated;
  min-width: 32px;
  min-height: 32px;
  background-color: unset;
  border: none;
  position: relative;
}

button:hover, button:active {
  border: red 2px solid;
}

</style>
