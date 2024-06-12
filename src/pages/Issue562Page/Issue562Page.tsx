import React,{ useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './Issue562Page.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const Issue562Page: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[8];
  const loadToVersion = dbVersionService.getDbVersion(dbName)!;

  const openDatabase = async (): Promise<any> => {
    try {
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
  const testIssue562 = async () => {
    setLog(prevLog => prevLog + '### Start Issue562 Issue ###\n');
    // open the database
    let db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      const result = await db.getTableList()
      console.log(`table list: ${JSON.stringify(result)}`)
      // Delete all data if any
      await db.execute('DELETE FROM test562;');
      await db.execute('VACUUM;', false);

      // Insert some Data

      const setIssue562 = [
        { statement: "INSERT INTO test562 (id, someColumn, body) values (?,?,?)",
          values: [
            ['72b8\$2z18:gp51bp\$2h18','someData','{"someKey":"someValue"}'],
            ['72b8\$3z18:gp51bp\$1h18','someData1','{"someKey":"someValue1"}'],
          ]
        },
      ];

      let ret = await db.executeSet(setIssue562);
      console.log(`ret.changes.changes: ${ret.changes.changes}`)
      if (ret.changes.changes !== 2) {
        throw new Error("ExecuteSet failed");
      }
      ret = await db.query("SELECT * from test562;")
      console.log(`ret.values.length: ${ret.values.length}`)
      if(ret.values.length !== 2) throw new Error("Query 1 testIssue562 test562 failed");

    }
    
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test Issue#562 ###\n');

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
              await testIssue562();
              await sqliteService.saveToStore(dbName);

            })
            .catch ((error) => {
              const msg = `Error : ${error}`;
              console.log(`msg: ${msg}`);
              Toast.show({
                text: `${msg}`,
                duration: 'long'
              });           
            });

          } else {
            try {
              testIssue562();
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
/*
    sqliteServ.closeDatabase(dbName,false).then(() => {
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
  */
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Issue562Page</IonTitle>
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
        <div id="comment-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Issue562Page;
