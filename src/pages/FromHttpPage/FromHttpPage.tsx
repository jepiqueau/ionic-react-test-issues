import React,{ useRef, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonButtons, IonBackButton, IonIcon, useIonViewWillEnter } from '@ionic/react';
  import './FromHttpPage.css';
  import { save } from 'ionicons/icons';
  
  import { Toast } from '@capacitor/toast';
  import { sqliteService } from '../../App';
  import { SQLiteDBConnection } from "@capacitor-community/sqlite";
  
const FromHttpPage: React.FC = () => {
    const ref = useRef(false);
    const isInitComplete = useRef(false);
    const [log, setLog] = useState('');
    const [isWeb, setIsWeb] = useState(false);
    const curDbName = useRef("");

    const openDatabase = async (dbName:string): Promise<any> => {
        try {
          const mDb = await sqliteService.openDatabase(dbName, 1, false);          
          setLog(prevLog => prevLog + `OpenDatabase ${dbName} successful\n`);
          curDbName.current = dbName;
          setLog(prevLog => prevLog + `curDbName ${curDbName.current} \n`);
          return mDb;
        } catch (error:any) {
          const msg = error.message ? error.message : error;
          throw new Error(`OpenDatabase: ${msg}`);
        }
      }
    
    const getFromHttp = async (url:string): Promise<void> => {
        try {
          console.log(`### in getFromHttp: before sqliteService.getFromHttpRequest`)
            await sqliteService.getFromHttpRequest(url, true);
            console.log(`### in getFromHttp: after sqliteService.getFromHttpRequest`)
          } catch(error: any) {
          const msg = error.message ? error.message : error;
          throw new Error(`getFromHttp: ${msg}`);
        }
    }

    const testHttpIssue = async () => {
        setLog(prevLog => prevLog + '### Start Test Http Issue ###\n');
        try {
            const url = "https://raw.githack.com/jepiqueau/angular-sqlite-app-starter/26ca67486713fc9b6ea4a37a889f0fd189c18926/src/assets/databases/dbForCopy.db";

            // Get db from http request
            await getFromHttp(url);
            setLog(prevLog => prevLog + `### After getFromHttp dbForCopy ###\n`);
            // Open the database
            let mDb: SQLiteDBConnection = await openDatabase('dbForCopy');
            console.log(`mDb: `,mDb)
            const retTables = await mDb.getTableList();
            console.log(`>>> retTables: ${JSON.stringify(retTables)}`);
            console.log(`>>> retTables.values.length: ${retTables.values!.length}`);

            if(retTables.values!.length !== 3 ||
              !retTables.values!.includes("areas") ||
              !retTables.values!.includes("elements") ||
              !retTables.values!.includes("issues")
            ) {
              throw new Error("GetTableList dbForCopy Tables failed");
            }
            setLog(prevLog => prevLog + `### GetTableList dbForCopy Tables successfull ###\n`);

            const url1 = "https://raw.githack.com/jepiqueau/angular-sqlite-app-starter/26ca67486713fc9b6ea4a37a889f0fd189c18926/src/assets/databases/Archive.zip";
            // Get db from http request
            setLog(prevLog => prevLog + `### load url1 ###\n`);
            await getFromHttp(url1);
            setLog(prevLog => prevLog + `### After getFromHttp Archive.zip ###\n`);
            // Open the databases
            const mDb1 = await openDatabase('dbZip1');
            const retTables1 = await mDb1.getTableList();
            console.log(`>>> retTables1: ${JSON.stringify(retTables1)}`);
            if(retTables1.values!.length !== 3 ||
              !retTables1.values!.includes("areas") ||
              !retTables1.values!.includes("elements") ||
              !retTables1.values!.includes("issues")
            ) {
              return Promise.reject("GetTableList dbZip1 Tables failed");
            }
            setLog(prevLog => prevLog + `### GetTableList dbZip1 Tables successfull ###\n`);

            const mDb12 = await openDatabase('dbZip2');
            const retTables12 = await mDb12.getTableList();
            console.log(`>>> retTables12: ${JSON.stringify(retTables12)}`);
            if(retTables12.values!.length !== 2 ||
              !retTables12.values!.includes("messages") ||
              !retTables12.values!.includes("users")
            ) {
              return Promise.reject("GetTableList dbZip2 Tables failed");
            }
            setLog(prevLog => prevLog + `### GetTableList dbZip2 Tables successfull ###\n`);


            const url2 = 'https://firebasestorage.googleapis.com/v0/b/ipmacae-app.appspot.com/o/bibles%2FNVI.zip?alt=media&token=3c035e3e-7a5e-4532-bbf2-4e93e5d69b61';
            // Get db from http request
            await getFromHttp(url2);
            setLog(prevLog => prevLog + `### After getFromHttp NVI ###\n`);
            // Open the database
            const mDb2 = await openDatabase('NVI');
            const retTables2 = await mDb2.getTableList();
            console.log(`>>> retTables2: ${JSON.stringify(retTables2)}`);
            if(retTables2.values!.length !== 4 ||
              !retTables2.values!.includes("book") ||
              !retTables2.values!.includes("metadata") ||
              !retTables2.values!.includes("testament") ||
              !retTables2.values!.includes("verse")
            ) {
              return Promise.reject("GetTableList NVI Tables failed");
            }
            setLog(prevLog => prevLog + `### GetTableList NVI Tables successfull ###\n`);

            setLog(prevLog => prevLog + '### End Test FromHttp issue#534 ###\n');
          
        } catch(error: any) {
          const msg = error.message ? error.message : error;
          throw new Error(`TestFromHttpIssue: ${msg}`);
        }
    };
    const saveToStore = (async () => {
        console.log(`in saveToStore curDbName: ${curDbName.current}`)
        await sqliteService.saveToStore(curDbName.current);
    });
    const handleSave = (async () => {
        console.log(`in handleSave curDbName: ${curDbName.current}`)
        await saveToStore();
        console.log(`>>>>> after saveToStore`)
        // write database to local disk for development only
        await sqliteService.saveToLocalDisk(curDbName.current);
    console.log(`>>>>> after saveToLocalDisk`)

    });
    
    useIonViewWillEnter( () => {
    
        // Setup logic
        if(ref.current === false) {
            if(sqliteService.getPlatform() === "web") {
            customElements.whenDefined('jeep-sqlite').then(async () => {
                setIsWeb(true);
                await testHttpIssue();
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
                testHttpIssue();
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
      }, []);
    

    return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>FromHttpPage</IonTitle>
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
            <div id="fromhttp-page-container">
              <pre>{log}</pre> {/* Render log in a <pre> tag */}
            </div>
          </IonContent>
        </IonPage>
      );
    
};
export default FromHttpPage;
