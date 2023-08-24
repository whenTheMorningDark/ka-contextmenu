<template>
  <div style="width: 500px; height: 100%; overflow: scroll; background-color: #ddd">
    <div class="contextMenua" @contextmenu="contextmenu">123</div>
    <button class="ingoreBtn">不隐藏的按钮</button>
    <ContextMenu ref="contextmenuRef" popper-class="myContextMenu" is-fixed>
      <ContentItem disabled>组合</ContentItem>
      <ContentItem class="myItem">取消组合</ContentItem>
      <ContentItem>分层</ContentItem>
      <ContentItem>取消分层取消分层</ContentItem>
    </ContextMenu>
    <div style="height: 2000px">我很高</div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue"
import ContextMenu from "./components/ContextMenu.vue"
import ContentItem from "./components/ContextItem.vue"
const contextmenuRef = ref()
const contextmenu = (e: MouseEvent) => {
  console.log("www")
  contextmenuRef.value.show(e)
}
</script>
<style>
html {
  width: 100%;
  height: 100%;
}
body {
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
}
.contextMenua {
  border: 1px solid black;
  width: 120px;
  height: 80px;
  background-color: red;
}
</style>
