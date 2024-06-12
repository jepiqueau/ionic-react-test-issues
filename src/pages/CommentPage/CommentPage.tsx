import React,{ useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './CommentPage.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const CommentPage: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[1];
  const loadToVersion = dbVersionService.getDbVersion(dbName)!;

  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
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
  const setContacts: Array<capSQLiteSet>  = [
    { statement:"INSERT INTO contacts /* Contact Simpson */ (name,FirstName,email,company,age,MobileNumber) VALUES (?,?,?,?,?,?);",
      values:["Simpson","Tom","Simpson@example.com",,69,"4405060708"]
    },
    { statement:"INSERT INTO contacts /* three more contacts */ (name,FirstName,email,company,age,MobileNumber) VALUES (?,?,?,?,?,?) -- Add Jones, Whiteley and Brown;",
      values:[
        ["Jones","David","Jones@example.com",,42.1,"4404030201"],
        ["Whiteley","Dave","Whiteley@example.com",,45.3,"4405162732"],
        ["Brown","John","Brown@example.com",,35,"4405243853"]
      ]
    },
    { statement:"UPDATE contacts SET age = ? , MobileNumber = ? WHERE id = ? -- Update Jones Contact;",
      values:[51.4,"4404030202",6]
    }
  ];
  const setMessages: Array<capSQLiteSet>  = [
    { statement:`
    /* Define the messages table */
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY NOT NULL,
      contactid INTEGER, -- key to contacts(id)
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      last_modified INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (contactid) REFERENCES contacts(id) ON DELETE SET DEFAULT
    );`,
      values:[]
    },
  ];
  const testCommentIssue = async () => {
    setLog(prevLog => prevLog + '### Start Comment Issue ###\n');
    // open the database
    const db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      // Delete all data if any
      await db.execute('DELETE FROM contacts');
      if (loadToVersion > 1) {
        await db.execute('DELETE FROM messages');
      }

      let insertQuery = 'INSERT INTO contacts (name,FirstName,email,company,age,MobileNumber) VALUES (?, ?, ?, ?, ?, ?) -- Add Sue Hellen;';
      let bindValues = ["Hellen","Sue","sue.hellen@example.com",,42,"4406050807"];
      let ret = await db.run(insertQuery, bindValues);
      console.log(`>>> run ret 1: ${JSON.stringify(ret)}`)
      insertQuery = `INSERT INTO contacts /* some contacts */ (name,FirstName,email,company,age,MobileNumber) VALUES 
          ('Doe','John','john.doe@example.com', 'IBM', 30, '4403050926'), -- add Doe
          ('Watson','Dave','dave.watson@example.com','Apple', 30, '4407050932') /* add Watson */,
          ('Smith', 'Jane', 'jane.smith@example.com', 'IBM', 27, '33607556142') /* Add Smith */-- End of add contact;`;
      bindValues = [];
      ret = await db.run(insertQuery, bindValues);
      console.log(`>>> run ret 2: ${JSON.stringify(ret)}`)

      let selectQuery = "SELECT * /* all columns */ FROM contacts WHERE company = 'IBM' -- for company IBM;";
  
      ret = await db.query(selectQuery);
      console.log(`>>> query "IBM" ret: ${JSON.stringify(ret)}`)

      ret = await db.executeSet(setContacts);
      console.log(`>>> executeSet 1 ret: ${JSON.stringify(ret)}`)

      selectQuery = "SELECT email /* only email */ FROM contacts WHERE company ISNULL -- for company not given;";
      ret = await db.query(selectQuery);
      console.log(`>>> query "NULL" ret: ${JSON.stringify(ret)}`)

      console.log(`####### before setMessages #######`)
      ret = await db.executeSet(setMessages);
      console.log(`>>> executeSet 2 ret: ${JSON.stringify(ret)}`)

    }
    
    ref.current = true;
    setLog(prevLog => prevLog + '### End Test Comment Issue ###\n');

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
              await testCommentIssue();
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
              testCommentIssue();
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
          <IonTitle>CommentPage</IonTitle>
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

export default CommentPage;
