import React,{ useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './Issue561Page.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const Issue561Page: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[7];
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
  const testIssue561 = async () => {
    setLog(prevLog => prevLog + '### Start Issue561 Issue ###\n');
    // open the database
    let db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      // Delete all data if any
      await db.execute('DELETE FROM users;');
      await db.execute('VACUUM;', false);

      let ret = await db.isTable("users")
      if(!ret.result) throw new Error(`table "users" does not exists`);
      // Create sync table

      ret = await db.createSyncTable();
      // set the synchronization date
      let syncDate = "2021-08-01T08:42:25.000Z";
      await db.setSyncDate(syncDate);
      // get the synchronization date
      const retSyncDate = await db.getSyncDate();
      console.log(`syncDate: ${retSyncDate}`)
      if(retSyncDate !== "2021-08-01T08:42:25.000Z"
      ) {
        throw new Error("Get the synchronization date failed");
      }

      // Insert some Users
      const row = [["Whiteley","Dave","dave.whiteley@example.com"],["Smith","John","john.smith.@example.com"]];

      let twoUsers = `
        INSERT INTO users (last_name,first_name, email) VALUES ('${row[0][0]}','${row[0][1]}','${row[0][2]}');
        INSERT INTO users (last_name,first_name, email) VALUES ('${row[1][0]}','${row[1][1]}','${row[1][2]}');
      `;
      ret = await db.execute(twoUsers);
      if (ret.changes.changes !== 2) {
        throw new Error("Execute 3 users failed");
      }
      // add one user with statement and values
      let sqlcmd = "INSERT INTO users (last_name,first_name, email) VALUES (?,?,?)";
      let values = ["Smith","Sue","sue.smith@example.com"];
      ret = await db.run(sqlcmd,values);
      if(ret.changes.lastId !== 3) {
        throw new Error("Run 1 user failed");
      }
      // test full export
      let jsonObj = await db.exportToJson('full');
      console.log(`jsonObj: ${JSON.stringify(jsonObj.export)} `)

      ret = await db.isExists();
      if (ret.result) {
        console.log(`ret.result before: ${ret.result}`)
        await db.delete();
      }
      ret = await db.isExists();
      console.log(`ret.result after: ${ret.result}`)
      await sqliteService.closeDatabase("testIssue561", false);
      setDb(null);
      // full import
      ret = await sqliteService.importDatabase(jsonObj.export,true)
      // open the database
      db = await openDatabase();
      console.log(`db:`,db)
      setDb(db);
      // get Table's list
      ret = await db.getTableList();
      console.log(`&&&& table List: ${JSON.stringify(ret)}`)

      ret = await db.query("SELECT * from users;")
      if(ret.values.length !== 3) throw new Error("Query 1 testIssue561 Users failed");

    }
    
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test Issue#561 ###\n');

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
              await testIssue561();
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
              testIssue561();
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
          <IonTitle>Issue561Page</IonTitle>
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

export default Issue561Page;
