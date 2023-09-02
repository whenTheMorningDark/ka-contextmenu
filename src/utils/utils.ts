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

export const siblingElem = (elem: Element | null): Element[] => {
  const _nodes: Element[] = []
  if (!elem) {
    return _nodes
  }
  let _elem: Element | null = elem

  while ((_elem = _elem.previousElementSibling)) {
    _nodes.push(_elem)
  }

  _elem = elem

  while ((_elem = _elem.nextElementSibling)) {
    _nodes.push(_elem)
  }

  return _nodes
}
