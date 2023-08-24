<template>
  <div
    class="context-item"
    :class="itemClass"
    @click="handleClick"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, inject } from "vue"
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
    "is-hover": isHover.value
  }
})

const handleClick = (e: MouseEvent) => {
  if (props.disabled) {
    return
  }
  emit("click", e)
  props.hideOnClick && menuHide?.()
}

const handleMouseenter = (e: MouseEvent) => {
  if (props.disabled) return
  isHover.value = true
  emit("mouseenter", e)
}

const handleMouseleave = (e: MouseEvent) => {
  if (props.disabled) return
  isHover.value = false
  console.log("handleMouseleave")
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
  }
  &.is-disabled {
    cursor: not-allowed;
  }
}
</style>
