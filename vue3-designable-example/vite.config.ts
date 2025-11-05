import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import AntDesignVueResolver from 'antdv-component-resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      resolvers: [AntDesignVueResolver()],
    }),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
  ],
})
