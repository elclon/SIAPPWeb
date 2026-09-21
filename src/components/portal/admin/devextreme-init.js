import config from 'devextreme/core/config';
import { locale, loadMessages } from 'devextreme/localization';
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

// Inicializar licencia DevExtreme globalmente
config({ licenseKey });

// Configurar idioma español
loadMessages(esMessages);
locale('es');
