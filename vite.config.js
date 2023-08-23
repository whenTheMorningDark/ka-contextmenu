// vite.config.js
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: "./src/components/index.ts",
      name: "HelloWorld",
      formats: ["umd"]
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        },
        entryFileNames: `ka-contextmenu.js`
      }
    }
  }
})
