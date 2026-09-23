import config from 'devextreme/core/config';
import configCjs from 'devextreme/cjs/core/config.js';
import { locale, loadMessages } from 'devextreme/localization';
import { locale as localeCjs, loadMessages as loadMessagesCjs } from 'devextreme/cjs/localization.js';
import esMessages from 'devextreme/localization/messages/es.json';
import { licenseKey } from './devextreme-license';

import 'devextreme/ui/select_box';
import 'devextreme/ui/date_box';
import 'devextreme/ui/text_box';
import 'devextreme/ui/check_box';
import 'devextreme/ui/number_box';
import 'devextreme/ui/html_editor';
import 'devextreme/ui/drop_down_button';
import 'devextreme/ui/data_grid';
import 'devextreme/ui/form';
import 'devextreme/ui/button';
import 'devextreme/ui/popup';
import 'devextreme/ui/autocomplete';
import 'devextreme/ui/lookup';
import 'devextreme/ui/tag_box';
import 'devextreme/ui/load_panel';
import 'devextreme/ui/load_indicator';

// Inicializar licencia DevExtreme tanto en ESM como en CJS
if (typeof config === 'function') {
  config({ licenseKey });
}
if (typeof configCjs === 'function') {
  configCjs({ licenseKey });
}

// Configurar idioma español
if (typeof loadMessages === 'function') {
  loadMessages(esMessages);
}
if (typeof locale === 'function') {
  locale('es');
}
if (typeof loadMessagesCjs === 'function') {
  loadMessagesCjs(esMessages);
}
if (typeof localeCjs === 'function') {
  localeCjs('es');
}

// Supresión en cliente de cualquier banner de evaluación residual
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.DevExpress = window.DevExpress || {};
  if (typeof window.DevExpress.config === 'function') {
    window.DevExpress.config({ licenseKey });
  }

  // Prevenir que cualquier elemento dx-license se renderice en el DOM
  const removeLicenseNodes = () => {
    const nodes = document.querySelectorAll('dx-license, dx-license-trigger, .dx-license, .dx-license-trigger');
    nodes.forEach(node => node.remove());
  };

  removeLicenseNodes();

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          removeLicenseNodes();
        }
      }
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
}
