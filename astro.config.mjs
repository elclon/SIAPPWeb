// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['devextreme', 'devextreme-vue']
    },
    optimizeDeps: {
      include: [
        'devextreme/core/config',
        'devextreme/localization',
        'devextreme/ui/notify',
        'devextreme/ui/dialog',
        'devextreme/ui/select_box',
        'devextreme/ui/date_box',
        'devextreme/ui/text_box',
        'devextreme/ui/check_box',
        'devextreme/ui/number_box',
        'devextreme/ui/html_editor',
        'devextreme/ui/drop_down_button',
        'devextreme/ui/data_grid',
        'devextreme/ui/form',
        'devextreme/ui/button',
        'devextreme/ui/popup',
        'devextreme/ui/load_panel',
        'devextreme/ui/load_indicator',
        'devextreme/data/data_source',
        'devextreme-vue/button',
        'devextreme-vue/data-grid',
        'devextreme-vue/form',
        'devextreme-vue/drop-down-button',
        'devextreme-vue/select-box',
        'devextreme-vue/date-box',
        'devextreme-vue/check-box',
        'devextreme-vue/number-box',
        'devextreme-vue/text-box',
        'devextreme-vue/html-editor',
        'devextreme-vue/popup'
      ]
    }
  },

  integrations: [vue()]
});