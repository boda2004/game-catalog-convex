import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DebugPanel() {
  const debugInfo = useQuery(api.games.debugUserGames);

  if (!debugInfo) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p>User ID: {debugInfo.userId}</p>
        <p>Your games count: {debugInfo.userGameCount}</p>
        <p>Game IDs: {debugInfo.gameIds.length}</p>
        <details>
          <summary className="cursor-pointer">Your game names ({debugInfo.userGameNames?.length || 0})</summary>
          <ul className="mt-2 ml-4 list-disc">
            {debugInfo.userGameNames?.map((name: string, i: number) => (
              <li key={i}>{name}</li>
            )) || <li>No games</li>}
          </ul>
        </details>
      </div>
    </div>
  );
}
