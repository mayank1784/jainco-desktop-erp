import { initializeApp } from 'firebase/app';
import { createClient } from '@supabase/supabase-js';
import configService from './services/configService';



// Configuration loader function
async function loadConfigurations() {
  try {
    // Ensure electronAPI exists
    //@ts-expect-error ddd
    if (!window.electronAPI) {
      console.error('Electronic API not available');
      return null;
    }

    // Get Firebase configuration
    //@ts-expect-error ddd
    const firebaseConfig = await window.electronAPI.getFirebaseConfig();
    const firebaseApp = initializeApp(firebaseConfig);
    
    // Get Supabase configuration
    //@ts-expect-error ddd
    const supabaseConfig = await window.electronAPI.getSupabaseConfig();
    const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);

    // Store in config service
    configService.setFirebaseApp(firebaseApp);
    configService.setSupabaseClient(supabaseClient);

    console.log('Firebase and Supabase initialized successfully');

    return {
      firebaseApp,
      supabaseClient,
      firebaseConfig,
      supabaseConfig
    };
  } catch (error) {
    console.error('Configuration loading error:', error);
    throw error;
  }
}

export default loadConfigurations;