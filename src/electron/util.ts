import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { app } from "electron";
import { Database as SQLiteDatabase } from "better-sqlite3";
import { ipcMain, IpcMainInvokeEvent } from "electron";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function initializeDotenv(): boolean {
  let envPath: string;

  if (app.isPackaged) {
    // In packaged app, look for .env in resources directory
    envPath = path.join(process.resourcesPath, ".env");
  } else {
    // In development, use project root .env
    envPath = path.join(process.cwd(), ".env");
  }

  // Load environment variables
  try {
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.error("Error loading .env file:", result.error);
        return false;
      }
      return true;
    } else {
      console.warn(`No .env file found at ${envPath}`);
      return false;
    }
  } catch (error) {
    console.error("Error checking .env file:", error);
    return false;
  }
}

/**
 * Wrapper for ipcMain.handle to ensure consistent handling of database and errors.
 * @param channel - The IPC channel name.
 * @param handler - The handler function to execute.
 * @param db - The database instance, must be non-null.
 */
export const wrapIpcHandler = <Args extends unknown[]>(
  channel: string,
  handler: (db: SQLiteDatabase, event: IpcMainInvokeEvent, ...args: Args) => Promise<unknown> | unknown,
  db: SQLiteDatabase | null
) => {
  ipcMain.handle(channel, async (event, ...args: Args) => {
    try {
      if (!db) {
        throw new Error("Database is not initialized.");
      }
      // Pass db explicitly to the handler
      return await handler(db, event, ...args);
    } catch (error: unknown) {
      console.error(`Error in IPC handler for ${channel}:`, error);
      return { success: false, error: (error as Error).message || "Unknown error" };
    }
  });
};

