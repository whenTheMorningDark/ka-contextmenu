<template>
  <Teleport to="body" v-if="isShow">
    <div class="contextMenu" ref="contextmenuRef">1234</div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref } from "vue"
const isShow = ref(false)
</script>
<style lang="scss" scoped>
.contextMenu {
  position: absolute;
  min-width: 150px;
  padding-top: 5px;
  padding-bottom: 8px;
  background-color: #fff;
  border-radius: 4px;
}
</style>
