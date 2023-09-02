<template>
  <Teleport to="body">
    <div class="contextMenu-wrapper" :class="{ 'is-fixed': fixed }">
      <transition name="fade">
        <div class="contextMenu" ref="contextmenuRef" :style="style" :class="[popperClass]" v-if="visible" tabindex="0">
          <slot />
        </div>
      </transition>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, provide, onBeforeMount } from "vue"
const contextmenuRef = ref<HTMLDivElement | null>(null)
import useClickOutside from "./UseClickOutSide"
import { siblingElem, findParentWithLimit } from "../utils/utils"
interface Props {
  ignore?: string[]
  popperClass?: string
  isFixed?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  ignore: () => [] as string[],
  isFixed: false
})

const visible = ref(false)
const fixed = ref(false)
const isSubmenu = ref(false)
const currentSubMenuIndex = ref(-1)
const currentItem = ref()
const currentParent = ref<HTMLElement | Element | null>(null)

const defaultSyleOverFlow = ref()
const emit = defineEmits(["hide"])
const position = ref({
  top: 0,
  left: 0
})

const activeIndex = ref(-1)

const style = computed(() => {
  return {
    left: position.value.left + "px",
    top: position.value.top + "px"
  }
})
watch(
  () => fixed.value,
  () => {
    if (fixed.value) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = defaultSyleOverFlow.value
    }
  }
)
const hide = () => {
  visible.value = false
  activeIndex.value = -1
  isSubmenu.value = false
  currentParent.value = null
  emit("hide", visible.value)
}
provide("hide", hide)
provide("isSubmenu", isSubmenu)
// 计算x,y的偏移值
const calculatePosition = (axis: "X" | "Y", mousePos: number, elSize: number) => {
  const windowSize = axis === "X" ? window.innerWidth : window.innerHeight
  const scrollPos = axis === "X" ? window.scrollX : window.scrollY

  let pos = mousePos - scrollPos
  if (pos + elSize > windowSize) {
    pos = Math.max(0, pos - elSize)
  }

  return pos + scrollPos
}
useClickOutside(
  contextmenuRef,
  () => {
    hide()
    fixed.value = false
  },
  { ignore: props.ignore }
)

const getNodeList = () => {
  const el = currentParent.value || contextmenuRef.value
  const contextItemNodeList = el?.querySelectorAll(".context-item")
  if (!contextItemNodeList || contextItemNodeList.length === 0) {
    return []
  }
  return contextItemNodeList
}

// 定义一个公共函数，用于处理箭头按键
const handleArrowKey = (isUp: boolean) => {
  const contextItemNodeList = getNodeList()
  if (contextItemNodeList.length === 0) {
    return
  }
  Array.from(contextItemNodeList).forEach((v) => {
    v.classList.remove("is-active")
  })

  // 根据按键的方向，增加或者减少 activeIndex
  activeIndex.value += isUp ? -1 : 1

  // 检查 activeIndex 是否超出边界，如果超出就循环回来
  const length = contextItemNodeList.length
  if (activeIndex.value < 0) {
    activeIndex.value = length - 1
  } else if (activeIndex.value >= length) {
    activeIndex.value = 0
  }
  // 如果当前元素是不可用的，就跳过
  if (contextItemNodeList[activeIndex.value].className.includes("is-disabled")) {
    activeIndex.value += isUp ? -1 : 1
    if (activeIndex.value < 0) {
      activeIndex.value = length - 1
    } else if (activeIndex.value >= length) {
      activeIndex.value = 0
    }
  }

  contextItemNodeList[activeIndex.value].classList.add("is-active")
  currentItem.value = contextItemNodeList[activeIndex.value]
}

const handlArrowRight = async () => {
  const contextItemNodeList = getNodeList()
  if (contextItemNodeList.length === 0) {
    return
  }
  if (!currentItem.value) {
    return
  }
  if (!isSubmenu.value) {
    const isHasSubMenuItem = currentItem.value.classList.contains("context-sub-menu-item")
    if (isHasSubMenuItem) {
      isSubmenu.value = isHasSubMenuItem
      await nextTick()
      currentSubMenuIndex.value = activeIndex.value
      activeIndex.value = -1
      const siblingElement = siblingElem(currentItem.value)
      if (siblingElement.length > 0) {
        currentParent.value = siblingElement[0]
        handleArrowKey(false)
      }
    }
  }
}

const handlArrowLeft = () => {
  if (isSubmenu.value) {
    const nearstParent = findParentWithLimit(currentItem.value, 0)
    currentParent.value = findParentWithLimit(currentItem.value, 2)
    const nearstItem = siblingElem(nearstParent)[0]
    const contextItemNodeList = currentParent.value?.querySelectorAll(".context-item")
    if (!contextItemNodeList) {
      return
    }
    const index = Array.from(contextItemNodeList).findIndex((v) => v === nearstItem)
    currentItem.value = nearstItem
    activeIndex.value = index
    isSubmenu.value = false
  }
}

const keydownHandler = function (e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowUp":
      handleArrowKey(true)
      break
    case "ArrowDown":
      handleArrowKey(false)
      break
    case "ArrowLeft":
      handlArrowLeft()
      break
    case "ArrowRight":
      handlArrowRight()
      break
    default:
      break
  }
}

const show = async (e: MouseEvent) => {
  e.preventDefault()
  visible.value = true
  fixed.value = props.isFixed
  await nextTick()
  const el = contextmenuRef.value
  if (!el) {
    return
  }
  const width = el.clientWidth
  const height = el.clientHeight
  const { pageX: x, pageY: y } = e
  position.value.top = calculatePosition("Y", y, height)
  position.value.left = calculatePosition("X", x, width)
  // 先移除监听器再添加，避免重复添加
  el.removeEventListener("keydown", keydownHandler)
  el.addEventListener("keydown", keydownHandler)
  el.focus()
}

onMounted(async () => {
  if (props.isFixed) {
    await nextTick()
    defaultSyleOverFlow.value = document.body.style.overflow
    const style = window.getComputedStyle(document.body)
    defaultSyleOverFlow.value = style.overflow
  }
})
onBeforeMount(() => {
  const el = contextmenuRef.value
  if (!el) {
    return
  }
  el.removeEventListener("keydown", keydownHandler)
})
defineExpose({
  show,
  hide
})
</script>
<style lang="scss" scoped>
.contextMenu-wrapper {
  z-index: 9999;
  background-color: transparent;

  &.is-fixed {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}

.contextMenu {
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px 0;
  margin: 0;
  background-color: #ffffff;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
  min-width: 10px;
  word-wrap: break-word;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
:focus-visible {
  outline: none;
}
</style>
