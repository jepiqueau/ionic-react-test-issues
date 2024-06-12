import React, { useRef, useEffect, useState, useContext, } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './BlobPage.css';
import { save, download } from 'ionicons/icons';
import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Buffer } from 'buffer';
import { Guid } from 'guid-typescript';
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const BlobPage: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[0];
  const loadToVersion = dbVersionService.getDbVersion(dbName)!;

  const bufferToBlob = (buffer: Buffer, contentType: string): Blob => {
    return new Blob([buffer], { type: contentType });
  }
  const stringToBlob = (text: string, contentType: string): Blob => {
    const buffer = new TextEncoder().encode(text);
    return new Blob([buffer], { type: contentType });
  }
  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const openDatabase = async (): Promise<any> => {
    try {
      console.log(`@@@ in openDatabase dbName: ${dbName}`)
      console.log('@@@ loadToVersion: ', loadToVersion)
      const mDb = await sqliteService.openDatabase(dbName,loadToVersion, false);
      console.log('@@@ mDB: ', mDb)
      
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

  const testBlogIssue = async () => {
    console.log('### Start Test Blog Issue ###\n')
    setLog(prevLog => prevLog + '### Start Test Blog Issue ###\n');
    // open the database
    const db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);
    const insertQuery = 'INSERT INTO d_categories (label, GUID, position) VALUES (?, ?, ?);';
//    const buffer = Buffer.from('Hello, world!');
//    console.log(`buffer: `,buffer)
    const guid = Guid.create().toString();
    console.log(`guid: ${guid}`)
//    const buffer:Buffer = Buffer.from(guid, 'utf-8');
    const buffer:Buffer = Buffer.from(guid, 'binary');
    console.log(`buffer: `, buffer)
    const pos = getRandomNumber(0, 2^8 - 1);
    const bindValues = [`test${pos}`, buffer, pos];
    if (db !== null) {
      const ret = await db.run(insertQuery, bindValues);
      console.log(`>>> run ret: ${JSON.stringify(ret)}`)
    }
    const selectQuery = 'SELECT * FROM d_categories WHERE GUID = ?;';
  
    const bindValues_select = [buffer];
    if (db !== null) {
      const ret = await db.query(selectQuery, bindValues_select);
      console.log(`>>> query ret: ${JSON.stringify(ret)}`)
    }
    
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test Blog Issue ###\n');

  }
  const handleSave = (async () => {
    await sqliteService.saveToStore(dbName);
    // write database to local disk for development only
    await sqliteService.saveToLocalDisk(dbName);
  });

  const handleExport = (async () => {
    const exportJsonObj = await db!.exportToJson('full');
    console.log(`*** exportJsonObj *** \n`);
    console.log(JSON.stringify(exportJsonObj));
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
              await testBlogIssue();
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
              testBlogIssue();
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
          <IonTitle>BlobPage</IonTitle>
          <IonButtons slot="start">
            <IonBackButton text="home" defaultHref="/home"></IonBackButton>
          </IonButtons>
            <IonButtons slot="end">
            <IonIcon icon={download} onClick={handleExport}></IonIcon>
            {isWeb && (
               <IonIcon icon={save} onClick={handleSave}></IonIcon>
            )}
            </IonButtons>
      </IonToolbar>
      </IonHeader>
      <IonContent>
        <div id="blob-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BlobPage;
