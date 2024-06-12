import React,{ useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './Issue558Page.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const Issue558Page: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[6];
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
  const testIssue558 = async () => {
    setLog(prevLog => prevLog + '### Start Issue558 Issue ###\n');
    // open the database
    const db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      // Delete all data if any
      await db.execute('DELETE FROM documents;');
      await db.execute('VACUUM;', false);

      // Insert some Documents
      const row = [['0123','9F14C512-AFF9-4D28-935D-C660B5DA7C57','1716373921.jpeg','.jpg','https://my-server/GetFile.aspx?PublicToken=kXgBagqzHAOG8ABzopcwc3RzqnDfp1cwVpVIGd2zmxbvb3gbmIS70o9hY7wj1lx6ZyFpA1OeUt28X/bhs/MUvROfDKLQ6+/Umqvt5I40ECg=',''],
      ['0123','9F14C512-AFF9-4D28-935D-C660B5DA7K58','1716374522.jpeg','.jpg','https://my-server/GetFile.aspx?PublicToken=kXgBagqzHAOG8ABzopcwc3RzqnDfp1cwVpVIGd2zmxbvb3gbmIS70o9hY7wj1lx6ZyFpA1OeUt28X/bhs/MUvROfDKLQ7+/Umqvt5I40ECg=','']];
      let insertQuery = `
        INSERT INTO documents (taskID, id, name, fileType, url, location) VALUES ('${row[0][0]}','${row[0][1]}','${row[0][2]}','${row[0][3]}','${row[0][4]}','${row[0][5]}');
        INSERT INTO documents (taskID, id, name, fileType, url, location) VALUES ('${row[1][0]}','${row[1][1]}','${row[1][2]}','${row[1][3]}','${row[1][4]}','${row[1][5]}');
      `;
      console.log(`>>>> insertQuery: ${insertQuery}`)
      let ret = await db.execute(insertQuery);
      if (ret.changes.changes !== 2) {
        throw new Error("Execute documents failed");
      }

      insertQuery = 'INSERT INTO documents (taskID, id, name, fileType, url, location) VALUES (?,?,?,?,?,?);';
      let bindValues = ['0123','9F14C512-AFF9-4D28-935D-C660B5DA7V35','1716374730.jpeg','.jpg','https://my-server/GetFile.aspx?PublicToken=kXgBagqzHAOG8ABzopcwc3RzqnDfp1cwVpVIGd2zmxbvb3gbmIS70o9hY7wj1lx6ZyFpA1OeUt28X/bhs/MUvROfDKLQ8+/Umqvt5I40ECg=',null];
      ret = await db.run(insertQuery, bindValues);
      console.log(`>>> run ret 1: ${JSON.stringify(ret)}`)
      if(ret.changes.lastId !== 3) {
        throw new Error("Run with values 1 document failed");
      }

      insertQuery = `INSERT INTO documents (taskID, id, name, fileType, url, location)
      VALUES ('0123','9F14C512-AFF9-4D28-935D-C660B5DA8W14','1716374730.jpeg','.jpg','https://my-server/GetFile.aspx?PublicToken=kXgBagqzHAOG8ABzopcwc3RzqnDfp1cwVpVIGd2zmxbvb3gbmIS70o9hY7wj1lx6ZyFpA1OeUt28X/bhs/MUvROfDKLQ9+/Umqvt5I40ECg=', '');`;
      bindValues = [];
      ret = await db.run(insertQuery, bindValues);
      console.log(`>>> run ret 2: ${JSON.stringify(ret)}`)
      if(ret.changes.lastId !== 4) {
        throw new Error("Run with statement 1 document failed");
      }

      let selectQuery = "SELECT * FROM documents;";
  
      ret = await db.query(selectQuery);
      console.log(`>>> query ret: ${JSON.stringify(ret)}`)

    }
    
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test Issue#558 ###\n');

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
              await testIssue558();
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
              testIssue558();
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
          <IonTitle>Issue558Page</IonTitle>
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

export default Issue558Page;
