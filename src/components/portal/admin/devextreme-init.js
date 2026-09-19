import config from 'devextreme/core/config';
import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import { licenseKey } from './devextreme-license';

// Inicializar licencia DevExtreme globalmente
config({ licenseKey });

// Configurar idioma español
loadMessages(esMessages);
locale('es');
