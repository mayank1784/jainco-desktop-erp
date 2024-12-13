import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { app } from "electron";
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
