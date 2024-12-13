import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import * as path from "path";
import { isDev } from "./util.js";
import { initializeDotenv } from "./util.js";
import ConfigManager from "./configManager.js";
import { dbManager } from "./db/manager.js";
import { Database as SQLiteDatabase } from "better-sqlite3";
initializeDotenv();

// Ensure required environment variables are present
function validateEnvVariables() {
  const requiredKeys = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "SUPABASE_URL",
    "SUPABASE_KEY",
  ];

  for (const key of requiredKeys) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
let mainWindow: BrowserWindow | null;
let db: SQLiteDatabase | null = null;
// Create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Function to create the main application window
function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? "./dist-electron/preload.cjs" : "../dist-electron/preload.cjs"
  );
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // Isolate context for security
      preload: getPreloadPath(),
    },
  });
  // Initialize configurations
  const firebaseConfig = ConfigManager.getFirebaseConfig();
  const supabaseConfig = ConfigManager.getSupabaseConfig();

  // Test active push message to Renderer-process.
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send("firebase-config", firebaseConfig);
    mainWindow?.webContents.send("supabase-config", supabaseConfig);
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // IPC handlers for config-related operations
  ipcMain.handle("get-firebase-config", () => {
    return ConfigManager.getFirebaseConfig();
  });

  ipcMain.handle("get-supabase-config", () => {
    return ConfigManager.getSupabaseConfig();
  });

  // Set initial configs from environment variables if not set
  if (!firebaseConfig.apiKey) {
    ConfigManager.setFirebaseConfig({
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || "",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || "",
    });
  }

  if (!supabaseConfig.url) {
    ConfigManager.setSupabaseConfig({
      url: process.env.SUPABASE_URL || "",
      key: process.env.SUPABASE_KEY || "",
    });
  }
  // Load the React app (index.html) from the build folder
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow
      .loadFile(path.join(__dirname, "../dist-react/index.html"))
      .catch((err) => {
        console.error("Failed to load index.html:", err);
      });
  }

  // Handle the window close event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

// App ready event
// Initialize database connection
app.whenReady().then(async () => {
  try {
    console.log("Validating environment variables...");
    validateEnvVariables();
    console.log("Environment variables validated.");
    console.log("Initializing database...");

    // Initialize database using dbManager
    const dbInitialized = dbManager.initialize();

    if (!dbInitialized) {
      console.error("Failed to initialize database");
      app.quit();
      return;
    }

    // Get the global database instance after initialization
    db = dbManager.getDatabase();
    if (!db) {
      console.error("Database could not be initialized");
      app.quit();
      return;
    }

    console.log("Database initialized successfully.");

    createMainWindow(); // After DB initialization, create the window
  } catch (error) {
    console.error("Error during app initialization:", error);
    app.quit();
  }
});

// Quit the app when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Recreate a window when the app icon is clicked (macOS behavior)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
