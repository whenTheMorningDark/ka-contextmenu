<template>
  <Teleport to="body" v-if="visible">
    <div class="contextMenu-wrapper" :class="{ 'is-fixed': fixed }">
      <div class="contextMenu" ref="contextmenuRef" :style="style" :class="[popperClass]">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from "vue"
const contextmenuRef = ref<HTMLDivElement | null>(null)
import useClickOutside from "./UseClickOutSide"

interface Props {
  ignore: string[]
  popperClass?: string
  isFixed: boolean
}
const props = withDefaults(defineProps<Props>(), {
  ignore: () => [] as string[],
  isFixed: false
})

const visible = ref(false)
const fixed = ref(false)

const defaultSyleOverFlow = ref()

const position = ref({
  top: 0,
  left: 0
})
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
    visible.value = false
    fixed.value = false
  },
  { ignore: props.ignore }
)

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
  console.log(position.value, "w")
}
onMounted(async () => {
  if (props.isFixed) {
    await nextTick()
    defaultSyleOverFlow.value = document.body.style.overflow
    const style = window.getComputedStyle(document.body)
    defaultSyleOverFlow.value = style.overflow
  }
})
defineExpose({
  show
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
}
</style>
