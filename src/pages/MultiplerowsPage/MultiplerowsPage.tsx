import React,{ useRef, useState} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './MultiplerowsPage.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const MultiplerowsPage: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[4];
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

  const setContacts: Array<capSQLiteSet>  = [
    { statement:"INSERT INTO contacts /* Contact Simpson */ (name,email,age) VALUES (?,?,?);",
      values:["Simpson","Simpson@example.com",69]
    },
    { statement:"INSERT INTO contacts /* three more contacts */ (name,email,age) VALUES (?,?,?) -- Add O'Connor, O'Hara and Brown;",
      values:[
        ["O'Connor","O'Connor@example.com",42.1],
        ["O'Hara","O'Hara@example.com",45.3],
        ["Brown","Brown@example.com",35]
      ]
    },
    { statement:"UPDATE contacts SET age = ? WHERE id = ? -- Update O'Connor Contact;",
      values:[51.4,2]
    },
    { statement:"insert into contacts /* three more contacts */ (name,email,age) values (?,?,?) -- Add O'Grady, O'Mahony and O'Kelly;",
      values:[
        ["O'Grady","O'Grady@example.com",25.2],
        ["O'Mahony","O'Mahony@example.com",32.3],
        ["O'Kelly","O'Kelly@example.com",37]
      ]
    },
    { statement:"update contacts set age = ? where id = ? -- Update O'Grady Contact;",
      values:[27.2,5]
    },
    { statement:"INSERT INTO contacts (name,email,age) VALUES (?,?,?) ON CONFLICT (email) DO UPDATE SET name = excluded.name;",
      values:[
        ["Smith","O'Connor@example.com",22.5],
        ["Doe","Brown@example.com",52]
      ]
    },

  ];
  const testMultipleRows = async () => {
    setLog(prevLog => prevLog + '### Start MultipleRows Test ###\n');
    // open the database
    const db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      /* ExecuteSet Command */

      const resS1 = await db.executeSet(setContacts, false, 'no');
      console.log(`>>> resS1: ${JSON.stringify(resS1)}`);

/*
      // Mode 'one'
      setUsers = [
        { statement:"INSERT INTO test (name,email) VALUES ('Valley','valley@example.com'), ('Botta', 'Botta@example.com') RETURNING name;",
          values:[
          ]
        }
      ];
      const resS2 = await db.executeSet(setUsers, false, 'one');
      console.log(`>>> resS2: ${JSON.stringify(resS2)}`);

      //Mode 'no'
      setUsers = [
        { statement:"INSERT INTO test (name,email) VALUES ('Fisher','fisher@example.com'), ('Summerfield', 'summerfield@example.com') RETURNING *;",
          values:[
          ]
        }
      ];
      const resS3 = await db.executeSet(setUsers, false, 'no');
      console.log(`>>> resS3: ${JSON.stringify(resS3)}`);
*/
    }
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test MultipleRows ###\n');

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
              await testMultipleRows();
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
              testMultipleRows();
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
          <IonTitle>MultipleRowsPage</IonTitle>
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
        <div id="multiplerows-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MultiplerowsPage;
