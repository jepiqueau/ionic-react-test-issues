import React, { useEffect, useRef } from 'react';
import { Toast } from '@capacitor/toast';
import './AppInitializer.css';
import { initializeAppService } from '../../services/initializeAppService';


interface AppInitializerProps {
  children : any;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const ref = useRef(false);
  useEffect(()=> {
    const initApp = async ():Promise <void> => {
      try {
        await initializeAppService.initializeApp();
        return;
      } catch(error: any) {
        const msg = error.message ? error.message : error;
        Toast.show({
          text: `${msg}`,
          duration: 'long'
        });           
      }  
    };
    if(ref.current === false) {
      initApp();
      ref.current = true;
    }

  }, [initializeAppService]);

  return <>{children}</>
};

export default AppInitializer;
