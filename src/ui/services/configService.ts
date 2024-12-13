import { FirebaseApp } from 'firebase/app';
import { SupabaseClient } from '@supabase/supabase-js';

class ConfigService {
  private static instance: ConfigService;
  private _firebaseApp: FirebaseApp | null = null;
  private _supabaseClient: SupabaseClient | null = null;

  private constructor() {}

  // Singleton pattern to ensure only one instance
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Set Firebase app
  setFirebaseApp(app: FirebaseApp) {
    this._firebaseApp = app;
  }

  // Set Supabase client
  setSupabaseClient(client: SupabaseClient) {
    this._supabaseClient = client;
  }

  // Get Firebase app
  get firebaseApp(): FirebaseApp {
    if (!this._firebaseApp) {
      throw new Error('Firebase app not initialized');
    }
    return this._firebaseApp;
  }

  // Get Supabase client
  get supabaseClient(): SupabaseClient {
    if (!this._supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    return this._supabaseClient;
  }

  // Check if services are initialized
  get isInitialized(): boolean {
    return this._firebaseApp !== null && this._supabaseClient !== null;
  }
}

// Export a singleton instance
export const configService = ConfigService.getInstance();
export default configService;