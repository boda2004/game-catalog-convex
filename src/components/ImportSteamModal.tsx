import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type ImportResult = {
  name: string;
  success: boolean;
  addedName?: string;
  error?: string;
  alreadyOwned?: boolean;
};

interface ImportSteamModalProps {
  onClose: () => void;
  onImported?: (results: ImportResult[]) => void;
}

export function ImportSteamModal({ onClose, onImported }: ImportSteamModalProps) {
  const [steamIdOrUrl, setSteamIdOrUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const importOwnedGames = useAction(api.steam.importOwnedGames);
  const createImportJob = useMutation(api.games.createImportJob);
  const job = useQuery(api.games.getImportJob, jobId ? ({ jobId } as any) : undefined);
  const total = job?.total ?? 0;
  const completed = job?.completed ?? 0;
  const isRunning = job?.status === "running";

  const handleImport = async () => {
    if (!steamIdOrUrl.trim()) return;
    setIsImporting(true);
    try {
      const createdJobId = await createImportJob({ type: "steam", total: 0 });
      setJobId(createdJobId as any);
      const res: ImportResult[] = await importOwnedGames({
        steamIdOrProfileUrl: steamIdOrUrl.trim(),
        jobId: createdJobId as any,
      });
      setResults(res);
      onImported?.(res);
    } catch (err) {
      console.error("Steam import failed", err);
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusColor = (result: ImportResult) => {
    if (!result.success) return "text-red-600";
    if (result.alreadyOwned) return "text-yellow-600";
    return "text-green-600";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add from Steam</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <p className="text-gray-600">
            Import your owned Steam games by entering your SteamID64 or Steam profile URL. <b>All games from your account will be imported. No filters or limits are applied.</b>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Steam ID or Profile URL</label>
            <input
              type="text"
              value={steamIdOrUrl}
              onChange={(e) => setSteamIdOrUrl(e.target.value)}
              placeholder="https://steamcommunity.com/id/yourname or 7656119XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {results.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Results:</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{r.name}</span>
                    <span className={getStatusColor(r)}>
                      {r.success ? (r.alreadyOwned ? "Already in your collection" : "Added") : r.error || "Error"}
                      {r.addedName && r.addedName !== r.name && ` (${r.addedName})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleImport}
              disabled={isImporting || !steamIdOrUrl.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting && isRunning && total > 0 ? `${completed} of ${total}` : isImporting ? "Importing..." : "Import"}
            </button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


