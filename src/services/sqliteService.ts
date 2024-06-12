import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, capSQLiteUpgradeOptions,
    capSQLiteChanges, capSQLiteVersionUpgrade } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface ISQLiteService {
    getPlatform(): string;
    initWebStore(): Promise<void>;
    addUpgradeStatement(dbName: string, upgrade:capSQLiteVersionUpgrade[]): Promise<void>; 
    openDatabase(dbName: string, loadToVersion: number, readOnly: boolean): Promise<SQLiteDBConnection>; 
    closeDatabase(dbName: string, readOnly: boolean): Promise<void>;
    saveToStore(dbName: string): Promise<void>;
    saveToLocalDisk(dbName: string): Promise<void>;
    isConnection(dbName: string, readOnly: boolean): Promise<boolean>;
    importDatabase(jsonImportObj: any, overwrite: boolean): Promise<capSQLiteChanges>;
    getFromHttpRequest(url: string, overwrite?: boolean) : Promise<void>;
};

class SQLiteService implements ISQLiteService {
    platform = Capacitor.getPlatform();
    sqlitePlugin = CapacitorSQLite;
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    dbNameVersionDict: Map<string, number> = new Map();

    getPlatform(): string {
        return this.platform;
    }
    async initWebStore() : Promise<void>  {
        try {
            console.log(`in SQLiteService initWebStore()`)
            await this.sqliteConnection.initWebStore();
            console.log(`in SQLiteService initWebStore()this.sqliteConnection: `, this.sqliteConnection)
            return;
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.initWebStore: ${msg}`);
        }

    }
    async addUpgradeStatement(dbName: string, upgrade:capSQLiteVersionUpgrade[] ): Promise<void> {
        try {
            console.log(`in SQLiteService addUpgradeStatement()this.sqlitePlugin: `, this.sqlitePlugin)
            console.log(`in SQLiteService addUpgradeStatement()this.sqliteConnection: `, this.sqliteConnection)
            console.log(`in SQLiteService addUpgradeStatement() dbName: `, dbName)
            console.log(`in SQLiteService addUpgradeStatement() upgrade: `, upgrade)
            await this.sqliteConnection.addUpgradeStatement(dbName, upgrade);
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.addUpgradeStatement: ${msg}`);
        }
        return;
    }
    async openDatabase(dbName:string, loadToVersion: number,
                readOnly: boolean): Promise<SQLiteDBConnection>  {
        this.dbNameVersionDict.set(dbName, loadToVersion);
        let encrypted = false;
        const mode = encrypted ? "secret" : "no-encryption";
        console.log('>>> Entering sqliteService.openDatabase')
        console.log(`>>> in openDatabase dbName: ${dbName}, loadToVersion: ${loadToVersion}`)
        try {
            let db: SQLiteDBConnection;
            const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
            let isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            console.log(`>>> in openDatabase retCC: ${retCC}, isConn: ${isConn}`)
            if(retCC && isConn) {
              db = await this.sqliteConnection.retrieveConnection(dbName, readOnly);
            } else {
                db = await this.sqliteConnection
                        .createConnection(dbName, encrypted, mode, loadToVersion, readOnly);
                        console.log('after createConnection: ',db)
            }
            const jeepSQlEL = document.querySelector("jeep-sqlite")
      
            await db.open();
            const res = await db.isDBOpen();
            console.log('>>> in openDatabase res: ', res.result )
            const tables = await db.getTableList();
            console.log('>>> in openDatabase tables: ',tables) 
            return db;
          
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.openDatabase: ${msg}`);
        }

    }
    async isConnection(dbName:string, readOnly: boolean): Promise<boolean> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if (isConn != undefined) {
                return isConn
            } else {
                throw new Error(`sqliteService.isConnection undefined`);
            }
        
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.isConnection: ${msg}`);
        }
    }
    async closeDatabase(dbName:string, readOnly: boolean):Promise<void> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if(isConn) {
                await this.sqliteConnection.closeConnection(dbName, readOnly);
            }
            return;
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.closeDatabase: ${msg}`);
        }
    }
    async saveToStore(dbName: string): Promise<void> {
        console.log('in sqliteService.saveToStore');
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, false)).result;
            console.log(`#### saveToStore isConn: ${isConn}`)
            await this.sqliteConnection.saveToStore(dbName);
            return;
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.saveToStore: ${msg}`);
        }
    }
    async saveToLocalDisk(dbName: string): Promise<void> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, false)).result;
            console.log(`#### saveToLocalDisk isConn: ${isConn}`)
            await this.sqliteConnection.saveToLocalDisk(dbName);
            return;
        } catch(err:any) {
            const msg = err.message ? err.message : err;
            throw new Error(`sqliteService.saveToLocalDisk: ${msg}`);
        }
    }
    async importDatabase(jsonImportObj: any, overwrite: boolean): Promise<capSQLiteChanges> {
        try {
            console.log("trying import...");
            jsonImportObj.overwrite = overwrite;
            const jsonstring = JSON.stringify(jsonImportObj);
            const isValidTry = await this.sqliteConnection.isJsonValid(jsonstring);
            if (isValidTry.result) {
              console.log("jsonImportObj is valid");
                const ret = await this.sqliteConnection.importFromJson(jsonstring);
                console.log(`ret: ${JSON.stringify(ret)}`);
                return ret;
            } else {
                console.log("jsonImportObj is not valid");
                return {changes: {changes: -1, lastId: -1}};
            }
          } catch (err: any) {
            const msg = err.message ? err.message : err;
            throw new Error(`sqliteService.importDatabase: ${msg}`);
          }
    }

    async getFromHttpRequest(url: string, overwrite?: boolean) : Promise<void> {
        const mOverwrite: boolean = overwrite != null ? overwrite : true;
        if (url.length === 0) {
            return Promise.reject(new Error(`Must give an url to download`));
        }
        if(this.sqliteConnection != null) {
            await this.sqliteConnection.getFromHTTPRequest(url, mOverwrite);
            return Promise.resolve();
        } else {
          return Promise.reject(new Error(`can't download the database`));
        }
    }

}
export default SQLiteService;
