
import { initializeDotenv } from './util.js';
import ElectronStore from 'electron-store';

// Define the structure of your configuration
interface ConfigSchema {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  supabase: {
    url: string;
    key: string;
  };
}

// Initialize dotenv to load environment variables from .env file
initializeDotenv();

// Create a secure Electron Store with encryption
const store = new ElectronStore<ConfigSchema>({
  name: 'secure-config',
  encryptionKey: process.env.ELECTRON_STORE_KEY || '', // Use an environment variable for encryption
  defaults: {
    firebase: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: '',
    },
    supabase: {
      url: '',
      key: '',
    },
  },
});

// Configuration management class
class ConfigManager {
  /**
   * Set Supabase configuration securely
   * @param config - Supabase configuration
   */
  static setSupabaseConfig(config: ConfigSchema['supabase']): void {
    if (!config.url || !config.key) {
      throw new Error('Supabase configuration must include both "url" and "key".');
    }
    store.set('supabase', config);
  }

  /**
   * Set Firebase configuration securely
   * @param config - Firebase configuration
   */
  static setFirebaseConfig(config: ConfigSchema['firebase']): void {
    const requiredKeys = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
      'measurementId',
    ];

    for (const key of requiredKeys) {
      if (!config[key as keyof ConfigSchema['firebase']]) {
        throw new Error(`Firebase configuration is missing required key: "${key}".`);
      }
    }
    store.set('firebase', config);
  }

  /**
   * Retrieve Supabase configuration
   * @returns Supabase configuration
   */
  static getSupabaseConfig(): ConfigSchema['supabase'] {
    const config = store.get('supabase');
    // if (!config.url || !config.key) {
    //   throw new Error('Supabase configuration is incomplete or not set.');
    // }
    return config;
  }

  /**
   * Retrieve Firebase configuration
   * @returns Firebase configuration
   */
  static getFirebaseConfig(): ConfigSchema['firebase'] {
    const config = store.get('firebase');
    // const requiredKeys = [
    //   'apiKey',
    //   'authDomain',
    //   'projectId',
    //   'storageBucket',
    //   'messagingSenderId',
    //   'appId',
    //   'measurementId',
    // ];

    // for (const key of requiredKeys) {
    //   if (!config[key as keyof ConfigSchema['firebase']]) {
    //     throw new Error(`Firebase configuration is missing required key: "${key}".`);
    //   }
    // }
    return config;
  }

  /**
   * Clear all configurations from the store
   */
  static clearConfigs(): void {
    store.clear();
    console.log('All configurations have been cleared.');
  }
}

// Export the configuration manager
export default ConfigManager;
