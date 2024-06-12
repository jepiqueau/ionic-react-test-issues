import React,{ useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonIcon, useIonViewWillEnter } from '@ionic/react';
import './ExportPage.css';
import { save } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService } from '../../App';
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { initializeAppService } from '../../services/initializeAppService';

const ExportPage: React.FC = () => {
  const ref = useRef(false);
  const isInitComplete = useRef(false);
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);

  /*
          [2,[56,52,97,100,97,51,98,48,45,98,101,52,53,45,55,52,101,99,45,56,48,55,50,45,101,48,57,53,50,100,53,50,99,102,101,56],"test2",2,0],
          [3,[53,48,55,52,49,102,53,99,45,49,56,52,98,45,55,100,98,99,45,98,53,101,52,45,53,50,57,51,51,52,99,97,57,102,101,57],"test3",3,0],
          [4,[51,98,98,100,57,49,54,56,45,98,48,52,98,45,54,53,97,102,45,50,97,51,50,45,102,99,101,48,50,57,51,100,102,97,55,56],"test4",4,0],
          [5,[57,56,51,48,101,49,57,99,45,51,50,97,56,45,101,53,55,97,45,100,53,97,49,45,50,53,56,98,98,54,101,98,54,53,100,102],"test5",5,0]

INSERT OR REPLACE INTO d_categories(ID,GUID,label,position,deleted) VALUES (1, [97,57,48,57,99,49,102,57,45,48,56,53,98,45,50,97,53,101,45,55,53,48,102,45,99,56,56,100,101,102,56,48,99,97,98,48], 'test1', 1, 0);
*/
  const exportObj= {"export":
    {"version":1,"encrypted":false,
    "tables":[
      {
        "name":"d_categories",
        "schema":[
          {"column":"ID","value":"INTEGER PRIMARY KEY"},
          {"column":"GUID","value":"BLOB"},
          {"column":"label","value":"varchar(255) NOT NULL"},
          {"column":"position","value":"tinyint(4) NOT NULL"},
          {"column":"deleted","value":"BOOLEAN DEFAULT 0"}
        ],
        "values":[
          [1,[97,57,48,57,99,49,102,57,45,48,56,53,98,45,50,97,53,101,45,55,53,48,102,45,99,56,56,100,101,102,56,48,99,97,98,48],"test1",1,0],
          [2,[56,52,97,100,97,51,98,48,45,98,101,52,53,45,55,52,101,99,45,56,48,55,50,45,101,48,57,53,50,100,53,50,99,102,101,56],"test2",2,0],
          [3,[53,48,55,52,49,102,53,99,45,49,56,52,98,45,55,100,98,99,45,98,53,101,52,45,53,50,57,51,51,52,99,97,57,102,101,57],"test3",3,0],
          [4,[51,98,98,100,57,49,54,56,45,98,48,52,98,45,54,53,97,102,45,50,97,51,50,45,102,99,101,48,50,57,51,100,102,97,55,56],"test4",4,0],
          [5,[57,56,51,48,101,49,57,99,45,51,50,97,56,45,101,53,55,97,45,100,53,97,49,45,50,53,56,98,98,54,101,98,54,53,100,102],"test5",5,0]
        ]
      },
      {
        "values":[
          [1,"dsfsdf","<p>Dfdsfsdfdsfsdf</p>","#fcfcfc",1706107098203,1706107098203],
          [2,"dsfdsfsf","<p>Dsfdsfsdfdsf</p>","#fcfcfc",1706107108779,1706107108779],
          [3,"sdfsf","<p>Jgfjgfj</p>","#00FA9A",1706107122932,1706107137006]
        ],
      "schema":[
        {"value":"INTEGER PRIMARY KEY NOT NULL","column":"id"},
        {"value":"TEXT NOT NULL","column":"title"},
        {"value":"TEXT NOT NULL","column":"note"},
        {"value":"TEXT NOT NULL","column":"color"},
        {"value":"INTEGER DEFAULT (strftime('%s', 'now'))","column":"created"},
        {"value":"INTEGER DEFAULT (strftime('%s', 'now'))","column":"last_modified"}
      ],
      "name":"notes"
    },
    {
      "schema":[
        {"column":"id","value":"INTEGER PRIMARY KEY NOT NULL"},
        {"column":"title","value":"TEXT NOT NULL"},
        {"column":"note","value":"TEXT NOT NULL"},
        {"column":"color","value":"TEXT NOT NULL"},
        {"column":"created","value":"INTEGER DEFAULT (strftime('%s', 'now'))"},
        {"column":"last_modified","value":"INTEGER DEFAULT (strftime('%s', 'now'))"}
      ],
      "name":"trash"
    },
    {
      "name":"archive",
      "schema":[
        {"value":"INTEGER PRIMARY KEY NOT NULL","column":"id"},
        {"value":"TEXT NOT NULL","column":"title"},
        {"value":"TEXT NOT NULL","column":"note"},
        {"value":"TEXT NOT NULL","column":"color"},
        {"value":"INTEGER DEFAULT (strftime('%s', 'now'))","column":"created"},
        {"value":"INTEGER DEFAULT (strftime('%s', 'now'))","column":"last_modified"}
      ]
    },
    {
      "schema":[
        {"value":"INTEGER PRIMARY KEY NOT NULL","column":"id"},
        {"value":"INTEGER","column":"note_id"},
        {"value":"INTEGER DEFAULT (strftime('%s', 'now'))","column":"created"},
        {"value":"INTEGER DEFAULT (strftime('%s', 'now'))","column":"last_modified"},
        {"foreignkey":"note_id","value":"REFERENCES notes(id) ON DELETE CASCADE"}
      ],
      "name":"notifcations"
    }
  ],
  "mode":"full",
  "database":"doublenote-db"
  }};
  const dbName = "doublenote-db";
  const openDatabase = async (): Promise<any> => {
    try {
      const mDb = await sqliteService.openDatabase(dbName, 1, false);
      console.log('mDB: ', mDb)
      
      setLog(prevLog => prevLog + 'OpenDatabase successful\n');
      return mDb;
    } catch (error:any) {
      const msg = error.message ? error.message : error;
      throw new Error(`OpenDatabase: ${msg}`);
    }
  }
  const testImportIssue = async () => {
    setLog(prevLog => prevLog + '### Start Test Import Issue ###\n');
    try {
      // Import Json Object
      const ret = await sqliteService.importDatabase(exportObj.export, true)
      setLog(prevLog => prevLog + `### After Import: ${ret.changes!.changes} ###\n`);
      // Open the database
      const mDb: SQLiteDBConnection = await openDatabase();
      // Query the database' table notes
      let stmt = "SELECT * FROM notes;"
      let result = await mDb.query(stmt);
      console.log(`>>> result.values: ${JSON.stringify(result.values)}`);
      // Query the database' table d_categories
      stmt = "SELECT * FROM d_categories;"
      result = await mDb.query(stmt);
      console.log(`>>> result.values: ${JSON.stringify(result.values)}`);
      ref.current = true;
      setLog(prevLog => prevLog + '### End Test Import Issue ###\n');
      } catch(error: any) {
      const msg = error.message ? error.message : error;
      throw new Error(`TestImportIssue: ${msg}`);
    }
  };
  const saveToStore = (async () => {
    await sqliteService.saveToStore(dbName);
  });
  const handleSave = (async () => {
    await saveToStore();
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
              await testImportIssue();
              await saveToStore();
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
              testImportIssue();
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ExportPage</IonTitle>
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
        <div id="export-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ExportPage;
