// scripts/cleanStorage.js
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

function getStoragePath() {
  // Adjust appName as needed
  const appName = "erp2";
  const storageBasePath =
    process.env.APPDATA || process.env.HOME || os.homedir();
  const basePath =
    process.platform === "darwin"
      ? path.join(storageBasePath, "Library", "Application Support", appName)
      : process.platform === "win32"
      ? path.join(storageBasePath, appName)
      : path.join(storageBasePath, ".config", appName);

  return basePath;
}

function deleteDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
    console.log(`Deleted storage directory: ${directory}`);
  } else {
    console.log(`No storage directory found at: ${directory}`);
  }
}

const storagePath = getStoragePath();
deleteDirectory(storagePath);
