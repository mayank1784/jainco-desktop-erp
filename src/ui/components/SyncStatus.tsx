import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import { format } from "date-fns";

const SyncStatus = () => {
  const { isOnline, isSyncing, lastSyncTime, syncData } = useOfflineStorage();

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
      <span className={isOnline ? "text-green-700" : "text-red-700"}>
        {isOnline ? "Online" : "Offline"}
      </span>
      {lastSyncTime && (
        <span className="text-gray-500">
          Last sync: {format(lastSyncTime, "PPp")}
        </span>
      )}
      <button
        onClick={syncData}
        disabled={!isOnline || isSyncing}
        className={`flex items-center space-x-1 px-2 py-1 rounded ${
          isOnline
            ? "text-blue-600 hover:text-blue-800"
            : "text-gray-400 cursor-not-allowed"
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
        <span>{isSyncing ? "Syncing..." : "Sync"}</span>
      </button>
    </div>
  );
};

export default SyncStatus;
