import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Obtiene la configuración de Firebase desde variables de entorno o de localStorage (para fácil configuración en UI)
export const getFirebaseConfig = () => {
  const savedConfig = localStorage.getItem('viaje_firebase_config');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    } catch {
      // Ignorar error de parsing
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
};

export const isFirebaseConfigured = () => {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey && 
    config.projectId && 
    !config.apiKey.includes('TU_API_KEY') && 
    !config.projectId.includes('tu-proyecto')
  );
};

let dbInstance = null;

export const initFirestore = () => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const config = getFirebaseConfig();
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.warn('No se pudo inicializar Firebase Firestore. Operando en modo local:', error);
    return null;
  }
};

export const getDb = () => {
  if (!dbInstance && isFirebaseConfigured()) {
    return initFirestore();
  }
  return dbInstance;
};
