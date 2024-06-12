import React, { FC } from 'react';
import './AppMenu.css';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
         IonList, IonItem, IonButton} from '@ionic/react';

interface AppMenuProps {}

const AppMenu: FC<AppMenuProps> = () => {
  const closeMenu = () => {
    const menu = document.querySelector('ion-menu');
    menu!.close();
  };

  return (
    <IonMenu className="AppMenu" side="end" contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu Content</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/issue514" expand="full">Blob issue#514</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/issue513" expand="full">Export issue#513</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/issue521" expand="full">Comment issue#521</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/returning" expand="full">RETURNING Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/transaction" expand="full">Transaction Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/getfromhttp" expand="full">Get from HTTP Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/multiplerows" expand="full">MultipleRows Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/executeset" expand="full">ExecuteSet Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/issue558" expand="full">Issue558 Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/issue561" expand="full">Issue561 Test</IonButton>
          </IonItem>
          <IonItem onClick={closeMenu}>
            <IonButton size="default" routerLink="/issue562" expand="full">Issue562 Test</IonButton>
          </IonItem>

          
          {/* ... other menu items */}
        </IonList>
      </IonContent>
    </IonMenu>
  )
};
export default AppMenu;
