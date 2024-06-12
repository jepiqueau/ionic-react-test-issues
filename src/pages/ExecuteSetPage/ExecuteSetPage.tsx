import React,{ useRef, useState} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './ExecuteSetPage.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const ExecuteSetPage: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[5];
  const loadToVersion = dbVersionService.getDbVersion(dbName)!;

  const openDatabase = async (): Promise<any> => {
    try {
      console.log('dbName: ', dbName)
      console.log('loadToVersion: ', loadToVersion)
      const mDb = await sqliteService.openDatabase(dbName,loadToVersion, false);
      console.log('mDB: ', mDb)
      
      setLog(prevLog => prevLog + 'OpenDatabase successful\n');
      return mDb;
    } catch (error) {
      const msg = `Error open database:: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });           
    }
  }
  const setExecute: Array<capSQLiteSet>  = [
    {
      statement: "INSERT INTO projects (id, project_name, full_reference, latitude, longitude, number_name, project_open, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
      values: [
        [17026,"Test Project","218.0TEST",55.7,-2.01,"218.0TEST Test Project",1,"2024-04-19 16:22:29",null],
        [17027,"Test Project 2","219.0TEST",55.7,-2.01,"219.0TEST Test Project 2",1,"2024-04-20 16:22:29",null]
      ]
    }

  ];
  const testExecuteSet = async () => {
    setLog(prevLog => prevLog + '### Start ExecuteSet Test ###\n');
    // open the database
    const db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      /* ExecuteSet Command */

      const resS1 = await db.executeSet(setExecute, false, 'no');
      console.log(`>>> resS1: ${JSON.stringify(resS1)}`);
    }
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test ExecuteSet ###\n');

  }
  const handleSave = (async () => {
    await sqliteService.saveToStore(dbName);
    // write database to local disk for development only
    await sqliteService.saveToLocalDisk(dbName);
  });

  useIonViewWillEnter( () => {
    const initSubscription = initializeAppService.isInitCompleted.subscribe((value) => {
      isInitComplete.current = value;
      if(isInitComplete.current === true) {

        // Setup logic
        if(ref.current === false) {
          if(sqliteService.getPlatform() === "web") {
            customElements.whenDefined('jeep-sqlite').then(async () => {
              setIsWeb(true);
              await testExecuteSet();
              await sqliteService.saveToStore(dbName);

            })
            .catch ((error) => {
              const msg = `Error: ${error}`;
              console.log(`msg: ${msg}`);
              Toast.show({
                text: `${msg}`,
                duration: 'long'
              });           
            });

          } else {
            try {
              testExecuteSet();
            } catch (error)  {
              const msg = `Error: ${error}`;
              console.log(`msg: ${msg}`);
              Toast.show({
                text: `${msg}`,
                duration: 'long'
              });           
            }
          }
        }
      }
    });
  }, []);
  useIonViewWillLeave(  () => {

    sqliteService.closeDatabase(dbName,false).then(() => {
      ref.current = false; 
      console.log('>>> After CloseDatabase') 
    })
    .catch((error) => {
      const msg = `Error close database:: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });           
    });
  
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ExecuteSetPage</IonTitle>
          <IonButtons slot="start">
            <IonBackButton text="home" defaultHref="/home"></IonBackButton>
          </IonButtons>
            <IonButtons slot="end">
            {isWeb && (
               <IonIcon icon={save} onClick={handleSave}></IonIcon>
            )}
            </IonButtons>
      </IonToolbar>
      </IonHeader>
      <IonContent>
        <div id="executeset-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ExecuteSetPage;
