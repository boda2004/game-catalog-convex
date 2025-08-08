import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface BulkAddResult {
  name: string;
  status: "added" | "already_exists" | "not_found" | "error";
  game?: string;
  error?: string;
}

interface BulkAddModalProps {
  onClose: () => void;
  onGamesAdded?: (results: BulkAddResult[]) => void;
}

export function BulkAddModal({ onClose, onGamesAdded }: BulkAddModalProps) {
  const [gameNames, setGameNames] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [results, setResults] = useState<BulkAddResult[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const addGamesByNames = useAction(api.rawg.addGamesByNames);
  const createImportJob = useMutation(api.games.createImportJob);
  const job = useQuery(api.games.getImportJob, jobId ? ({ jobId } as any) : undefined);

  const total = job?.total ?? 0;
  const completed = job?.completed ?? 0;
  const isRunning = job?.status === "running";

  const handleBulkAdd = async () => {
    const names = gameNames
      .split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) return;

    setIsAdding(true);
    try {
      // Create job then call action with jobId
      const createdJobId = await createImportJob({ type: "bulk", total: names.length });
      setJobId(createdJobId as any);
      const addResults = await addGamesByNames({ gameNames: names, jobId: createdJobId as any });

      // Transform results to match expected format
      const transformedResults: BulkAddResult[] = addResults.map((result: any) => {
        if (!result.success) {
          return {
            name: result.name,
            status: result.error === "Game not found" ? "not_found" : "error",
            game: result.addedName,
            error: result.error,
          } as const;
        }
        return {
          name: result.name,
          status: result.alreadyOwned ? "already_exists" : "added",
          game: result.addedName,
        } as const;
      });
      
      setResults(transformedResults);
      onGamesAdded?.(transformedResults);
    } catch (error) {
      console.error("Bulk add failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "added": return "text-green-600";
      case "already_exists": return "text-yellow-600";
      case "not_found": return "text-red-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "added": return "Added";
      case "already_exists": return "Already in your collection";
      case "not_found": return "Not found";
      case "error": return "Error";
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bulk Add Games</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Enter game names, one per line. We'll search for each game and add the best match to your catalog.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Names
            </label>
            <textarea
              value={gameNames}
              onChange={(e) => setGameNames(e.target.value)}
              placeholder="Enter game names, one per line:&#10;The Witcher 3&#10;Cyberpunk 2077&#10;Red Dead Redemption 2"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {results.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Results:</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{result.name}</span>
                    <span className={getStatusColor(result.status)}>
                      {getStatusText(result.status)}
                      {result.game && result.game !== result.name && ` (${result.game})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleBulkAdd}
              disabled={isAdding || !gameNames.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding && isRunning && total > 0 ? `${completed} of ${total}` : isAdding ? "Adding..." : "Add Games"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
