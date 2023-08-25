# 前言
由于我个人做的项目是后台管理项目偏多，右键菜单也是属于比较高频的组件了。但是目前我个人使用的技术栈为Vue3，目前社区还没有很好的插件进行使用，只能被逼无奈选择自己造轮子了。
# 目录结构基本构成
初始阶段，我把菜单组件分成两个目录，分别命名为`ContextMenu.vue`和`ContentMenuItem.vue`,两个组件各施其职，`ContextMenu.vue`组件提供最外层容器定位和层级能力，`ContentMenuItem.vue`提供每项的样式和当前时间事件回调。
# ContextMenu.vue
ContextMenu组件，我是期望在能body中进行插入，这是为了方便组件的定位（`position`），那么这个时候是可以借助Vue3中的`Teleport`组件实现该效果。由于我的业务场景是在表格中右键，如果我对每行（`tr`）或者每个单元格（`td`）都生成一个菜单组件，就会导致body中存在多个菜单组件。这个并不符合我的预期想法，所以我决定使用`v-if`来控制组件的显示与隐藏。
基本的HTML结构如下：

```js
 <Teleport to="body" v-if="visible">
      <div
        class="contextMenu"
        ref="contextmenuRef"
      >
      </div>
  </Teleport>
  <script lang="ts" setup>
      const visible = ref(false)
  </script>
  <style>
      .contextMenu {
          position: absolute;
          min-width: 150px;
          min-height:100px;
          padding-top: 5px;
          padding-bottom: 8px;
          background-color: #fff;
          border-radius: 4px;
        }
  </style>
```
# 计算ContextMenu组件的位置(position)
想要知道`ContextMenu`组件会出现在什么位置，需要我们知道该组件中是怎么使用的？我假设有个.vue组件

```js
<el-button @contextmenu="contextmenuFun">按钮</el-button>
    <Contextmenu ref="ContextMenuRef">
      
    </Contextmenu>
import { ref } from 'vue'
const ContextMenuRef = ref()
const contextmenuFun = (e) => {
  ContextMenuRef.value.show(e)
}
```
在业务侧，可以看到。我是期望有个触发点的，无论按钮或者HTML元素也好。这个触发点，需要手动的去调用ContextMenu组件中show方法，并且需要把当前的触发事件源(`event`)传递过去。那么我们回到`ContextMenu`组件中就很容易写出`show`方法的逻辑。

```js
const position = ref({
  top: 0,
  left: 0
})
const style = computed(() => {
  return {
    left: position.value.left,
    top: position.value.top
  }
})

const show = (e: MouseEvent) => {
  console.log(e, "e")
  e.preventDefault()
  visible.value = true
}
```
那么contextMenu出现的位置则需要我们动态的进行计算，注意点就是出现的位置，我们是需要计算边界值。

```js
...
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

const show = async (e: MouseEvent) => {
  e.preventDefault()
  visible.value = true
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
...
```
我们通过`calculatePosition`计算出有效的x,y，在用`Math.max`确保显示不会超出当前的屏幕。
# 点击菜单外部隐藏
如何判断点击菜单外部进行隐藏呢？这个时候，就需要借助点击对象中的`event`事件进行处理了，把处理点击元素外围作为一个hook进行使用并命名为`useClickOutside`

```js
import { onMounted, onBeforeUnmount, Ref } from "vue"

function useClickOutside(elementRef: Ref<HTMLElement | null>, callback: (event: MouseEvent) => void): void {
  const clickOutsideHandler = (event: MouseEvent) => {
    const el = elementRef.value
    if (!el || el === event.target || event.composedPath().includes(el)) {
      return
    }
    callback(event)
  }

  onMounted(() => {
    window.addEventListener("click", clickOutsideHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("click", clickOutsideHandler)
  })
}

export default useClickOutside

```

```js
 <div class="contextMenu" ref="contextmenuRef" :style="style">1234</div>
const contextmenuRef = ref<HTMLDivElement | null>(null)
import useClickOutside from "./UseClickOutSide"
useClickOutside(contextmenuRef, () => {
  visible.value = false
})
```
这个时候我们就能实现点击菜单外部让菜单隐藏了，但是还会伴随一个问题，就是如果，我右键展开了菜单，当我去点击某个按钮的时候，我不希望这个这个菜单进行隐藏，而是希望一直显示。这个时候，就需要针对`useClickOutside`添加一个额外的参数进行控制。
`针对点击某个元素，菜单不隐藏`

在业务代码中，可以通过传递`ignore`进行HTML元素排除


```js
div class="contextMenua" @contextmenu="contextmenu">123</div>
  <button class="ingoreBtn">不隐藏的按钮</button>
  <ContextMenu ref="contextmenuRef" :ignore="ignore" />
```
在contextmenu中定义props

```js
interface Props {
  ignore: string[]
}
const props = withDefaults(defineProps<Props>(), {
  ignore: () => [] as string[]
})
...
useClickOutside(
  contextmenuRef,
  () => {
    console.log("w")
    visible.value = false
  },
  { ignore: props.ignore }
)
...
```
在useClickOutside函数中新增`IgnoreElement`方法用来排除HTML元素

```js
let isIgnore = true
const IgnoreElement = (ignore: string[], event: MouseEvent) => {
    return ignore.some((target) => {
      if (typeof target === "string") {
        return Array.from(window.document.querySelectorAll(target)).some(
          (el) => el === event.target || event.composedPath().includes(el)
        )
      }
    })
  }
  const clickOutsideHandler = (event: MouseEvent) => {
      ...
       if (options?.ignore && options.ignore.length > 0) {
      isIgnore = !IgnoreElement(options.ignore, event)
    }
    if (!isIgnore) {
      isIgnore = true
      return
    }
    ...
  
  }
```
我们通过`isIgnore`变量进行打标识，用于判断是否经历过`IgnoreElement`的调用，默认为true，并不会影响现有逻辑。当`isIgnore`为false的时候，我们需要把它变成true，防止下次点击无法隐藏。
# 菜单不随着滚动条进行滚动
当我们的页面高度超出了屏幕高度时，会出现滚动条的情况，当我们对某个元素进行右键菜单的过程会出现，然后再去进行滚动，会发现我们的菜单也会跟随着移动。为了解决这个情况，可以使用一个透明的遮盖层盖住body，使得原本的滚动行为失效。
在这理论上，需要对HTML结构进行调整

```js
 <div class="contextMenu-wrapper" :class="{ 'is-fixed': fixed }">
      <div class="contextMenu" ref="contextmenuRef" :style="style" :class="[popperClass]">1234</div>
    </div>
    interface Props {
      ignore: string[]
      popperClass?: string
      isFixed: boolean
    }
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
    const show = async (e: MouseEvent) => {
        ...
        fixed.value = props.isFixed
        ...
    })
    useClickOutside(
      contextmenuRef,
      () => {
        visible.value = false
        fixed.value = false
      },
      { ignore: props.ignore }
    )
  onMounted(async () => {
  if (props.isFixed) {
        await nextTick()
        defaultSyleOverFlow.value = document.body.style.overflow
        const style = window.getComputedStyle(document.body)
        defaultSyleOverFlow.value = style.overflow
      }
})  
<style>
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
</style>
```
添加了`is-fixed`变量作为是否需要遮盖层的标识。通过`watch`监听fixed的变化，如果为真的话，则需要body的`overflow`变成hidden，关闭了的话恢复默认的值`defaultSyleOverFlow`

目前为止，就已经完成了下拉菜单的基本功能，但是还有以下功能还没有完成：
- 响应键盘事件
- 层级zIndex的控制
- 多层级菜单(subItem)

[github地址](https://github.com/whenTheMorningDark/ka-contextmenu)
