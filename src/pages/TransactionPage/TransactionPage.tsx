import { useRef, useEffect, useState, useContext, } from 'react';
import { Subscription } from 'rxjs';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon,
  IonButtons, IonBackButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import './TransactionPage.css';
import { save, download } from 'ionicons/icons';

import { Toast } from '@capacitor/toast';
import { sqliteService, dbVersionService } from '../../App';
import { initializeAppService } from '../../services/initializeAppService';
import { SQLiteDBConnection, capSQLiteSet } from "@capacitor-community/sqlite";
//import { useInitializeAppService } from  '../../components/AppInitializer/AppInitializer';
import { databases } from '../../upgrades';

const TransactionPage: React.FC = () => {
  const ref = useRef(false);
  const isInitComplete = useRef(false);
//  let initSubscription: Subscription;
  const [log, setLog] = useState('');
  const [isWeb, setIsWeb] = useState(false);

//  const initializeAppService = useInitializeAppService();
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const dbName: string = databases[3];
  const loadToVersion = dbVersionService.getDbVersion(dbName)!;
  const platform = sqliteService.getPlatform();

  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const generateRandomName = (pattern: string) => {
    return pattern.replace(/X/g, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)));
  }
  const deepcopyArray = (array: any[]): any[] => {
    // Check if the input array is null or undefined
    if (!array) {
        return [];
    }

    // Create a deep copy of the input array
    return array.map(item => {
        // Check if the item is an array
        if (Array.isArray(item)) {
            // Recursively deepcopy nested arrays
            return deepcopyArray(item);
        }
        // For non-array items, return a shallow copy
        return item;
    });
  };

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
  const setScores: Array<capSQLiteSet>  = [
    { statement:"INSERT INTO DemoTable (name, score) VALUES (?,?);",
      values:["Tom",205]
    },
    { statement:"INSERT INTO DemoTable /* three more scores */ (name, score) VALUES (?,?) -- Add David, Dave and John;",
      values:[
        ["David",165],
        ["Dave",320],
        ["John",211]
      ]
    },
    { statement:"UPDATE DemoTable SET score = ? WHERE name = ? -- Update Sue score;",
      values:[152,"Sue"]
    }
  ];
  const setScores1: Array<capSQLiteSet>  = [
    { statement:"INSERT INTO DemoTable (name, score) VALUES (?,?);",
      values:["Jenny",207]
    },
    { statement:"INSERT INTO DemoTable /* three more scores */ (name, score) VALUES (?,?) -- Add David, Dave and John;",
      values:[
        ["Bob",168],
        ["Allan",322],
        ["James",281]
      ]
    }
  ];
  const testTransactionDefault = async (db: SQLiteDBConnection) => {
    setLog(prevLog => prevLog + '### Start Transaction Default ###\n');

    if (db !== null) {
      // Delete all data if any
      await db.execute('DELETE FROM DemoTable');

      // run command
      let insertQuery = 'INSERT INTO DemoTable (name, score) VALUES (?, ?);';
      let bindValues = ["Sue", 102];
      let ret = await db.run(insertQuery, bindValues);
      console.log(`>>> run ret 1: ${JSON.stringify(ret)}`)
      // execute command
      const statements = `
        INSERT INTO DemoTable (name, score) VALUES ('Andrew',415);
        INSERT INTO DemoTable (name, score) VALUES ('Josh',310);
        INSERT INTO DemoTable (name, score) VALUES ('Billy',253);
      `;
      ret = await db.execute(statements);
      console.log(`>>> execute ret 1: ${JSON.stringify(ret)}`)

      // executeSet command
      ret = await db.executeSet(setScores);
      console.log(`>>> executeSet 1 ret: ${JSON.stringify(ret)}`)

      let selectQuery = "SELECT * /* all columns */ FROM Demotable;";
      const retQuery = await db.query(selectQuery);
      console.log(`>>> query All retQuery: ${JSON.stringify(retQuery)}`)

    }     
    setLog(prevLog => prevLog + '### End Test Transaction Default ###\n');

  }

  const testTransactionManage = async (db: SQLiteDBConnection) => {
    setLog(prevLog => prevLog + '### Start Transaction Manage ###\n');
    if (db !== null) {
      await db.beginTransaction();
      const isTransAct = await db.isTransactionActive();
      if(!isTransAct) {
        throw new Error('db Transaction not Active');
      }
      try {
        // run command
        let insertQuery = 'INSERT INTO DemoTable (name, score) VALUES (?, ?);';
        let bindValues = ["Betty", 152];
        let ret = await db.run(insertQuery, bindValues, false);
        console.log(`>>> run ret 2: ${JSON.stringify(ret)}`)
        // execute command
        const statements = `
          INSERT INTO DemoTable (name, score) VALUES ('Aimie',115);
          INSERT INTO DemoTable (name, score) VALUES ('Test1',330);
          INSERT INTO DemoTable (name, score) VALUES ('George',223);
        `;
        ret = await db.execute(statements,false);
        console.log(`>>> execute ret 2: ${JSON.stringify(ret)}`)

        // executeSet command
        ret = await db.executeSet(setScores1,false);
        console.log(`>>> executeSet 2 ret: ${JSON.stringify(ret)}`)


        // Commit Transaction
        await db.commitTransaction()
        if (platform === 'web') {
          await sqliteService.saveToStore(dbName);
        }
        setLog(prevLog => prevLog + '### Commit Test Transaction Manage ###\n');
      } catch (err) {
        console.log(`in catch : ${err}`)
        // Rollback Transaction
        await db.rollbackTransaction()
        setLog(prevLog => prevLog + '### RollBack Test Transaction Manage ###\n');

      } finally {
        let selectQuery = "SELECT * /* all columns */ FROM Demotable;";
        const retQuery = await db.query(selectQuery);
        console.log(`>>> query All retQuery2: ${JSON.stringify(retQuery)}`)
        setLog(prevLog => prevLog + '### End Test Transaction Manage ###\n');
      }
    }
  }

  const testExecuteTransaction = async (db: SQLiteDBConnection) => {
    setLog(prevLog => prevLog + '### Start Execute Transaction ###\n');
    if (db !== null) {
      const txn: any[] = [];
      txn.push({statement:'DELETE FROM DemoTable;'});
      const stmt = 'INSERT INTO DemoTable (name, score) VALUES (?, ?);';
      for (let i=0; i<100; i++ ) {
        const values = [`test${i}`, getRandomNumber(1, 1000)];
        txn.push({statement: stmt, values: values});
      }
      txn.push({statement: "DELETE FROM DemoTable WHERE name='test50';"});
      txn.push({statement:"UPDATE DemoTable SET score = ? WHERE name = ?",
      values:[152,"test10"]});
      try {
        const ret = await db.executeTransaction(txn);
        console.log(`testExecuteTransaction ret: ${JSON.stringify(ret)}`);
        setLog(prevLog => prevLog + '### Test ExecuteTransaction successfull###\n');

      } catch(err:any) {
        const msg = err.message ? err.message : err;
        console.log(`testExecuteTransaction msg: ${msg}`)
        setLog(prevLog => prevLog + `### Test ExecuteTransaction failed : ${msg} ###\n`);

      } finally {
        let selectQuery = "SELECT * /* all columns */ FROM Demotable;";
        const retQuery = await db.query(selectQuery);
        console.log(`>>> query All retQuery3: ${JSON.stringify(retQuery)}`)
        setLog(prevLog => prevLog + '### End Test ExecuteTransaction ###\n');
      }

    }   
  }

  const testIssue523 = async(db: SQLiteDBConnection) => {
    setLog(prevLog => prevLog + '### Start Test Transaction Issue 523 ###\n');
    if (db !== null) {
      const txn: any[] = [];
      txn.push({statement:'DELETE FROM accounts;'});
      const stmt523 = `INSERT INTO accounts 
      (ain,cin,openingDate,balance,customerName,schemeCode,categoryCode,phoneNo,
      email,bankName,bankCode,branchName,branchCode,bankRecieptName,branchRecieptName,bin,
      lin,loanAmount,accountName,isLoan,nain,groupNo,closingBalanceDate,lastTransactionDate)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
      console.log("**********************")
      console.log("* ExecuteTransaction *")
      console.log("**********************")

      const values =
          ["000000000000338","01401000338","2023-04-05T18:30:00Z",28030,"SAYAD SAHIL","12","","9036986909",
          null,"Manipal","Demo","Demo Society",null,"Samaja Seva S S","Demo",null,
          null,0,null,0,null,null,"2024-02-26T18:30:00Z","2024-02-25T18:30:00Z"];
      txn.push({statement: stmt523, values: values});
      for (let i=1; i<5; i++ ) {

        const mValues = deepcopyArray(values);
        const val = getRandomNumber(100, 399);
        mValues[0] = `000000000000${val}`;
        mValues[1] = `01401000${val}`;
        mValues[3] = getRandomNumber(100, 100000);
        mValues[4] = generateRandomName("XXXXX XXXXX");
        mValues[7] = (getRandomNumber(9000000000, 9999999999)).toString();
    
        txn.push({statement: stmt523, values: mValues});
      }
      try {
        const ret = await db.executeTransaction(txn);
        console.log(`Test Issue523 Transaction ret: ${JSON.stringify(ret)}`);

        // do the test with executeSet
      console.log("**************")
      console.log("* ExecuteSet *")
      console.log("**************")
      const newValues = [];
      for (let i=0; i<10; i++ ) {
        const mValues = deepcopyArray(values);
        const val = getRandomNumber(400, 13000);
        mValues[0] = `000000000000${val}`;
        mValues[1] = `01401000${val}`;
        mValues[3] = getRandomNumber(100, 100000);
        mValues[4] = generateRandomName("XXXXX XXXXX");
        mValues[7] = (getRandomNumber(9000000000, 9999999999)).toString();
        newValues.push(mValues);
      }
      const stmtSet = [{statement: stmt523, values: newValues}];
      const retSet = await db.executeSet(stmtSet,true);
      console.log(`Test Issue523 executeSet retSet: ${JSON.stringify(retSet)}`);
      setLog(prevLog => prevLog + '### Test Issue523 successfull###\n');

      } catch(err:any) {
        const msg = err.message ? err.message : err;
        console.log(`Test Issue523 Transaction msg: ${msg}`)
        setLog(prevLog => prevLog + `### Test Issue523  failed : ${msg} ###\n`);

      } finally {
        let selectQuery = "SELECT * FROM accounts;";
        const retQuery = await db.query(selectQuery);
        console.log(`>>> query All retQuery4 <<<`)
        retQuery.values?.forEach(row => {
          console.log(row);
        });
        setLog(prevLog => prevLog + '### End Test Issue523 Transaction ###\n');
      }
    }
  }
  const handleSave = (async () => {
    await sqliteService.saveToStore(dbName);
    // write database to local disk for development only
    await sqliteService.saveToLocalDisk(dbName);
  });

  const testAllTransactionTypes = (async() => {
    // open the database
    try {
    const db: SQLiteDBConnection = await openDatabase();
    console.log(`db:`, db)
      await testTransactionDefault(db);
      await testTransactionManage(db);
      await testExecuteTransaction(db);
      await testIssue523(db);

      ref.current = true;
    } catch(err: any) {
      const msg = err.message ? err.message : err;
      throw new Error(msg);
    }
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
              // Test All Transactions
              await testAllTransactionTypes();
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
              testAllTransactionTypes();
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
  });
  useIonViewWillLeave(  () => {
//    initSubscription.unsubscribe();
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
          <IonTitle>TransactionPage</IonTitle>
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
        <div id="transaction-page-container">
          <pre>{log}</pre> {/* Render log in a <pre> tag */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransactionPage;
