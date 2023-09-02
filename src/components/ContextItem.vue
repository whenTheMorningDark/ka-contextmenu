<template>
  <div
    class="context-item"
    :class="itemClass"
    @click="handleClick"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
    ref="contextItemRef"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, inject } from "vue"
import { IgnoreElement } from "../utils/utils"
const contextItemRef = ref()
const currentClass = ref()
interface Props {
  disabled?: boolean
  hideOnClick?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  hideOnClick: true
})
const emit = defineEmits(["mouseenter", "click", "mouseleave"])
const isHover = ref(false)
const menuHide = inject<() => void>("hide")
const itemClass = computed(() => {
  return {
    "is-disabled": props.disabled,
    "is-hover": isHover.value,
    "is-active": currentClass.value
      ? Array.from(currentClass.value)
        ? Array.from(currentClass.value).includes("is-active")
        : false
      : false
  }
})

const handleClick = (e: MouseEvent) => {
  if (props.disabled) {
    return
  }
  const isHasIngoreParent = IgnoreElement([".context-sub-menu-item"], e)

  if (isHasIngoreParent) {
    return
  }
  emit("click", e)
  props.hideOnClick && menuHide?.()
}

const handleMouseenter = (e: MouseEvent) => {
  if (props.disabled || !contextItemRef.value) return
  currentClass.value = contextItemRef.value.classList
  isHover.value = true
  emit("mouseenter", e)
}

const handleMouseleave = (e: MouseEvent) => {
  if (props.disabled) return
  isHover.value = false
  emit("mouseleave", e)
}
</script>

<style lang="scss">
.context-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  list-style: none;
  line-height: 22px;
  padding: 5px 16px;
  margin: 0;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  outline: none;
  &.is-hover {
    background-color: rgb(96, 56, 17);
    color: #fff;
    .iconfont {
      color: #fff;
    }
  }
  &.is-disabled {
    cursor: not-allowed;
    color: #a8abb2;
  }
  &.is-active {
    color: rgb(96, 56, 17);
    background-color: #f5f7fa;
    .iconfont {
      color: rgb(96, 56, 17);
    }
  }
}
</style>
