<template>
  <w-plate tile-name="main-background" :stripe-mode=1 stripe-color="#bababa" :padding="0">
    <div class="background">
      <div class="top">
        Do something....
      </div>
      <component class="middle" :is="view.component"></component>
      <!--    <router-link to="/chat">Chat</router-link>-->
      <div class="bottom">
        <w-button class="text-button" normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted">
          Back
        </w-button>
        <w-button class="text-button" normal-tile="large-beveled-button" active-tile="large-beveled-button-inverted">
          OK
        </w-button>
      </div>
    </div>
  </w-plate>
</template>

<script>
import WButton from '@/widgets/Button'
import WPlate from '@/widgets/Plate'
import { defineAsyncComponent, shallowRef } from 'vue'

const views = [
  {
    name: 'name',
    component: shallowRef(defineAsyncComponent(() => import('@/components/HomeName')))
  },
  {
    name: 'color',
    component: () => {}
  }
]

export default {
  name: 'Home',
  components: { WPlate, WButton },
  data: function () {
    return {
      view: undefined
    }
  },
  computed: {
  },
  created: function () {
    this.views = views
    this.view = this.views[0]
  },
  mounted: function () {

  }
}
</script>

<style>
.background {
  min-width: calc(256px * var(--global-ss));
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top {
  background: linear-gradient(180deg, rgba(251,146,154,1) 0%, rgba(251,56,73,1) 80%, rgba(251,0,24,1) 100%);
  padding: calc(6px * var(--global-ss));
  border-bottom: calc(1px * var(--global-ss)) solid black;
  text-align: center;
}
.middle {
  /*flex-grow: 1;*/
  /*display: flex;*/
  /*flex-direction: column;*/
  /*justify-content: center;*/
}
.bottom {
  background: linear-gradient(0deg, rgba(251,146,154,1) 0%, rgba(251,56,73,1) 80%, rgba(251,0,24,1) 100%);
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
