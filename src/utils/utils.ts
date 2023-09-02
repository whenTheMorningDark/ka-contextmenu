/**
 *
 * @param ignore 不需要的类名['.a']
 * @param event 鼠标事件
 * @returns boolean
 */
export const IgnoreElement = (ignore: string[], event: MouseEvent) => {
  return ignore.some((target) => {
    if (typeof target === "string") {
      return Array.from(window.document.querySelectorAll(target)).some(
        (el) => el === event.target || event.composedPath().includes(el)
      )
    }
  })
}
