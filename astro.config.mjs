// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'devextreme/core/config',
        'devextreme/localization',
        'devextreme/ui/notify',
        'devextreme/ui/dialog',
        'devextreme-vue/button',
        'devextreme-vue/data-grid',
        'devextreme-vue/form',
        'devextreme-vue/drop-down-button'
      ]
    }
  },

  integrations: [vue()]
});