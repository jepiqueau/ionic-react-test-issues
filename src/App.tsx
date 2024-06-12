import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import { Capacitor } from '@capacitor/core';
import SQLiteService  from './services/sqliteService';
import DbVersionService from './services/dbVersionService';
import AppInitializer from './components/AppInitializer/AppInitializer';

import ExportPage from './pages/ExportPage/ExportPage';
import BlobPage from './pages/BlobPage/BlobPage';
import CommentPage from './pages/CommentPage/CommentPage';
import ReturningPage from './pages/ReturningPage/ReturningPage';
import TransactionPage from './pages/TransactionPage/TransactionPage';
import FromHttpPage from './pages/FromHttpPage/FromHttpPage';
import MultiplerowsPage from './pages/MultiplerowsPage/MultiplerowsPage';
import ExecuteSetPage from './pages/ExecuteSetPage/ExecuteSetPage';
import Issue558Page from './pages/Issue558Page/Issue558Page';
import Issue561Page from './pages/Issue561Page/Issue561Page';
import Issue562Page from './pages/Issue562Page/Issue562Page';

import AppMenu from './components/AppMenu/AppMenu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

export const platform = Capacitor.getPlatform();

// Singleton Services
export const sqliteService = new SQLiteService();
export const dbVersionService = new DbVersionService();
//export const SqliteServiceContext = React.createContext(SqliteService);
//export const DbVersionServiceContext = React.createContext(DbVersionService);

setupIonicReact();

const App: React.FC = () => {
  return (
        <AppInitializer>
          <IonApp>
            <IonReactRouter>
              <AppMenu />
              <IonRouterOutlet id="main-content">
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/">
                  <Redirect to="/home" />
                </Route>
                <Route path="/issue513" component={ExportPage} />
                <Route path="/issue514" component={BlobPage} />
                <Route path="/issue521" component={CommentPage} />
                <Route path="/returning" component={ReturningPage} />
                <Route path="/transaction" component={TransactionPage} />
                <Route path="/getfromhttp" component={FromHttpPage} />
                <Route path="/multiplerows" component={MultiplerowsPage} />
                <Route path="/executeset" component={ExecuteSetPage} />
                <Route path="/issue558" component={Issue558Page} />
                <Route path="/issue561" component={Issue561Page} />
                <Route path="/issue562" component={Issue562Page} />
              </IonRouterOutlet>
            </IonReactRouter>
          </IonApp>
        </AppInitializer>
  )
}

export default App;
