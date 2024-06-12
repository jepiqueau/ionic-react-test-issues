import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import { Capacitor } from '@capacitor/core';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';
import { defineCustomElements as pwaElements} from '@ionic/pwa-elements/loader';

pwaElements(window);
customElements.define('jeep-sqlite', JeepSqlite);
const platform = Capacitor.getPlatform();

const rootRender = () => {
  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
if (platform !== "web") {
  rootRender();
} else {
  window.addEventListener('DOMContentLoaded', async () => {
      console.log('in main.ts DOMContentLoaded')
      const jeepEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepEl);

      customElements.whenDefined('jeep-sqlite').then(() => {
        console.log(`in main.ts customElements.whenDefined('jeep-sqlite')`)
        jeepEl.autoSave = true;
        // Save button's style
        jeepEl.buttonOptions = '{"backgroundColor":"#ed576b", "top":"70%","fontSize":"1.5em"}';
        rootRender();
      })
      .catch ((err) => {
        console.log(`Error: ${err}`);
        throw new Error(`Error: ${err}`)
      });
  });
}
 