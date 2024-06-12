import React,{ useRef, useState} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './ReturningPage.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';
import { databases } from '../../upgrades';

const ReturningPage: React.FC = () => {
  const ref = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const isInitComplete = useRef(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[2];
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
  const testReturning = async () => {
    setLog(prevLog => prevLog + '### Start RETURNING Test ###\n');
    // open the database
    const db = await openDatabase();
    console.log(`db:`,db)
    setDb(db);


    if (db !== null) {
      /* RUN Command */

      // mode 'no' INSERT
      const resI0:any = await db.run(`INSERT INTO test /* all columns */(name,email) VALUES 
        ('Ackerman','ackerman@example.com') , -- Add Ackerman 
        ('Jefferson','jefferson@example.com') /* Add Jefferson */; -- First Insert`,
        [],true,'no');
      console.log(`>>> resI0: ${JSON.stringify(resI0)}`);
      // mode 'all' INSERT
      const resI:any = await db.run(`INSERT INTO test (name,email) VALUES
       ('Jeepq','jeepq@example.com') , -- Add Jeepq
       ('Brown','brown@example.com') /* Add Brown */
       RETURNING *; -- Test with returning all mode`,
       [],true,'all');
      console.log(`>>> resI: ${JSON.stringify(resI)}`);
      // mode 'one' INSERT
      const resI1:any = await db.run("INSERT INTO test (name,email) VALUES ('Jones','jones@example.com') , ('Davison','davison@example.com') RETURNING email; -- Returning email mode one",[],true,'one');
      console.log(`>>> resI1: ${JSON.stringify(resI1)}`);
      // mode 'no' INSERT
      const resI2:any = await db.run("INSERT INTO test (name,email) VALUES ('White','white@example.com') , ('Johnson','Johnson@example.com') RETURNING name; -- Returning name mode no",[],true,'no');
      console.log(`>>> resI2: ${JSON.stringify(resI2)}`);
      // mode 'all' INSERT with values
      const resI3:any = await db.run(`INSERT INTO test (name,email) VALUES
       (?,?) , -- Add Dupont
       (?,?) /* Add Toto
       RETURNING name;-- Returning name all`,
       ['Dupond','dupond@example.com','Toto','toto@example.com'],true,'all');
      console.log(`>>> resI3: ${JSON.stringify(resI3)}`);
      // mode 'one' UPDATE
      const resU1:any = await db.run(`UPDATE test /* Update email */ SET email='jeepq.@company.com'
       WHERE name='Jeepq' RETURNING id,email; -- Returning id,email mode one`,[],true,'one');
      console.log(`>>> resU1: ${JSON.stringify(resU1)}`);
      // mode 'all' DELETE
      const resD1:any = await db.run("DELETE FROM test WHERE id IN (2,4,6) RETURNING id,name;",[],true,'all');
      console.log(`>>> resD1: ${JSON.stringify(resD1)}`);
      // Query the database
      const resQ1: any = await db.query('SELECT * FROM test;');
      console.log(`>>> resQ1: ${JSON.stringify(resQ1)}`);

      /* ExecuteSet Command */

      // Create some Sets of users
      // Mode 'all'
      let setUsers1 = [
        { statement:"INSERT INTO test (name,email) VALUES ('Simpson','simpson@example.com'), ('Devil', 'devil@example.com') RETURNING *;",
          values:[
          ]
        },
        { statement:`INSERT INTO test (name,email) VALUES 
         ('Dowson','dowson@example.com'), 
         ('Castel', 'castel@example.com') RETURNING name;`,
          values:[
          ]
        },
        { statement:"INSERT INTO test (name,email) VALUES (?,?) RETURNING *;",
          values:[
            ['Jackson','jackson@example.com'],
            ['Kennedy','kennedy@example.com']
          ]
        },
        { statement:"UPDATE test /* Updating email */ SET email = 'jackson@company.com' WHERE name = 'Jackson' RETURNING *;",
          values:[
          ]
        },
        { statement:"DELETE FROM test WHERE id IN (1,3,9) RETURNING *;",
          values:[
          ]
        }
      ];

      let setUsers = [
        { statement:"INSERT INTO test (name,email) VALUES ('Simpson','simpson@example.com'), ('Devil', 'devil@example.com') RETURNING *;",
          values:[
          ]
        },
        { statement:`INSERT INTO test (name,email) VALUES 
         ('Dowson','dowson@example.com'), -- Add Dowson
         ('Castel', 'castel@example.com') /* Add Castel */ RETURNING name;`,
          values:[
          ]
        },
        { statement:"INSERT INTO test (name,email) VALUES (?,?) RETURNING *; -- Insert with values",
          values:[
            ['Jackson','jackson@example.com'],
            ['Kennedy','kennedy@example.com']
          ]
        },
        { statement:"UPDATE test /* Updating email */ SET email = 'jackson@company.com' WHERE name = 'Jackson' RETURNING *; -- Updating Jackson email",
          values:[
          ]
        },
        { statement:"DELETE FROM test WHERE id IN (1,3,9) RETURNING *; -- Deleting id's 1,3,9",
          values:[
          ]
        }
      ];
      const resS1 = await db.executeSet(setUsers1, false, 'all');
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
    setLog(prevLog => prevLog + '### End Test RETURNING ###\n');

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
              await testReturning();
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
              testReturning();
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
          <IonTitle>ReturningPage</IonTitle>
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
        <div id="returning-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReturningPage;
