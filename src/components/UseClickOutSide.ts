import { onMounted, onBeforeUnmount, Ref } from "vue"
import { IgnoreElement } from "../utils/utils"
interface Options {
  ignore?: string[]
}
function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: (event: MouseEvent) => void,
  options?: Options
): void {
  let isIgnore = true
  const clickOutsideHandler = (event: MouseEvent) => {
    const el = elementRef.value
    if (!el || el === event.target || event.composedPath().includes(el)) {
      return
    }
    if (options?.ignore && options.ignore.length > 0) {
      isIgnore = !IgnoreElement(options.ignore, event)
    }
    if (!isIgnore) {
      isIgnore = true
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
