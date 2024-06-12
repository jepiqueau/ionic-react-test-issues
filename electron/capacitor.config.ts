import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeepq.ionic7.react.sqlite.test',
  appName: 'ionic-react-test-issues',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorSQLite: {
    iosDatabaseLocation: 'Library/CapacitorDatabase',
    iosIsEncryption: false,
    iosKeychainPrefix: 'ionic7-react-sqlite-app',
    iosBiometric: {
        biometricAuth: false,
        biometricTitle : "Biometric login for capacitor sqlite"
    },
    androidIsEncryption: false,
    androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
    },
    electronIsEncryption: false,
    electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
    electronMacLocation: "/Volumes/Development_Lacie/Development/Databases",
    electronLinuxLocation: "Databases"
    }
  }
};

export default config;
