import { onMounted, onBeforeUnmount, Ref } from "vue"
interface Options {
  ignore?: string[]
}
function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: (event: MouseEvent) => void,
  options?: Options
): void {
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
