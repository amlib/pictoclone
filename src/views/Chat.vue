<template>
  <div>
    <w-button icon="f"/>
    <w-plate/>
  </div>
</template>

<script>
import WButton from '@/widgets/Button'
import WPlate from '@/widgets/Plate'
export default {
  name: 'Chat',
  components: { WPlate, WButton }
}
</script>

<style scoped>

</style>
