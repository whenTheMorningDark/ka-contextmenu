import ContextMenu from "./ContextMenu.vue"
import { App } from "vue"
const install = (app: App) => {
  app.component("ContextMenu", ContextMenu)
}
export { install, ContextMenu }

const Contextmenu = {
  install
}

export default Contextmenu
