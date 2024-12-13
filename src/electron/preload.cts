const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
// Define the shape of Firebase and Supabase configurations
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface SupabaseConfig {
  url: string;
  key: string;
}

electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Common IPC Renderer methods
  ipcRenderer: {
    on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args;
      return ipcRenderer.on(channel, (event, ...args) =>
        listener(event, ...args)
      );
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args;
      return ipcRenderer.off(channel, ...omit);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
      const [channel, ...omit] = args;
      return ipcRenderer.send(channel, ...omit);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args;
      return ipcRenderer.invoke(channel, ...omit);
    },
  },
  getStaticsData: () => console.log("Hi statistics"),
   // Firebase configuration methods
   getFirebaseConfig: (): Promise<FirebaseConfig> => ipcRenderer.invoke('get-firebase-config'),
   onFirebaseConfig: (callback: (config: FirebaseConfig) => void) =>
     ipcRenderer.on('firebase-config', (_event, config: FirebaseConfig) => callback(config)),
 
   // Supabase configuration methods
   getSupabaseConfig: (): Promise<SupabaseConfig> => ipcRenderer.invoke('get-supabase-config'),
   onSupabaseConfig: (callback: (config: SupabaseConfig) => void) =>
     ipcRenderer.on('supabase-config', (_event, config: SupabaseConfig) => callback(config)),
});
