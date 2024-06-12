import { useContext } from 'react';
import { platform } from '../App';
import { BehaviorSubject } from 'rxjs';
import { ISQLiteService } from '../services/sqliteService'; 
import { IDbVersionService } from '../services/dbVersionService';
import { upgrades, databases } from '../upgrades';
import { sqliteService, dbVersionService } from '../App';

export interface IInitializeAppService {
    initializeApp(): Promise<boolean>
};

class InitializeAppService implements IInitializeAppService  {
    appInit = false;
    isInitCompleted = new BehaviorSubject(false);
  

    
    async setUpgradeStatements() : Promise<void> {
        try {
            if(upgrades.length !== databases.length) {
                const msg = 'upgrades and databases not the same length';
                console.log(`&&& Error: ${msg}`)
                throw new Error(`initializeAppError.setUpgradeStatements: ${msg}`);
            }
            for (const [index, upgrade] of upgrades.entries()) { 
                console.log(`>>>>> upgrade: `, upgrade)
                const loadToVersion = upgrade[upgrade.length-1].toVersion;
                const dbName: string = databases[index];
                dbVersionService.setDbVersion(dbName, loadToVersion);
                await sqliteService.addUpgradeStatement(dbName,upgrade);
                console.log(`****dbName: `, dbName);
                console.log(`****dbVersion: `, dbVersionService.getDbVersion(dbName))
            }
            console.log(`**** all dbs : `, dbVersionService.getAllDb())
        } catch(error: any) {
            const msg = error.message ? error.message : error;
            console.log(`&&& Error: ${msg}`)
            throw new Error(`initializeAppError.setUpgradeStatements: ${msg}`);
        }

    }
    async initializeApp() : Promise<boolean> {
        if(!this.appInit) {
            try {
                if (platform === 'web') {
                    const jeepSQlEL = document.querySelector("jeep-sqlite");
                    console.log(`InitializeAppService initializeApp jeepSQlEL: `,jeepSQlEL )
                    await sqliteService.initWebStore();
                    await this.setUpgradeStatements();
                } else {
                    await this.setUpgradeStatements();
                }
                this.isInitCompleted.next(true);
                this.appInit = true;
            } catch(error: any) {
                const msg = error.message ? error.message : error;
                console.log(`&&& Error: ${msg}`)
                throw new Error(`initializeAppError.initializeApp: ${msg}`);
            }
        }
        return this.appInit;
    }
}
export const initializeAppService = new InitializeAppService();
