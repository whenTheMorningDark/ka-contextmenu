<template>
  <div class="ka-contextmenu-submenu">
    <ContextItem>
      <span>{{ title }}</span>
      <span class="iconfont icon-rightarrow submenu-right-icon" />
    </ContextItem>
    <div class="context-submenu-wrapper">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
import ContextItem from "./ContextItem.vue"
interface Props {
  title: string
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
@import "../icon/iconfont.css";
.ka-contextmenu-submenu {
  position: relative;
}
.context-submenu-wrapper {
  position: absolute;
  right: 0;
  right: 0;
  transform: translateX(100%);
  top: 0px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
}
.submenu-right-icon {
  position: absolute;
  right: 6px;
  font-size: 12px;
  top: 6px;
  color: #606266;
}
</style>
