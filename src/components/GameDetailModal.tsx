import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface GameDetailModalProps {
  gameId: Id<"games">;
  onClose: () => void;
}

export function GameDetailModal({ gameId, onClose }: GameDetailModalProps) {
  const game = useQuery(api.games.getGameById, { gameId });
  const removeGame = useMutation(api.games.removeGameFromUser);

  const handleRemoveGame = async () => {
    try {
      await removeGame({ gameId });
      toast.success("Game removed from collection");
      onClose();
    } catch (error) {
      toast.error("Failed to remove game");
    }
  };

  if (!game) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with background image */}
        <div className="relative h-64 bg-gray-200 rounded-t-lg overflow-hidden">
          {game.backgroundImage && (
            <img
              src={game.backgroundImage}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-4 left-6">
            <h1 className="text-3xl font-bold text-white mb-2">{game.name}</h1>
            <div className="flex items-center gap-4 text-white/90">
              {game.released && (
                <span className="text-sm">{new Date(game.released).getFullYear()}</span>
              )}
              {game.rating && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm">{game.rating.toFixed(1)}</span>
                </div>
              )}
              {game.metacritic && (
                <div className="bg-green-600 px-2 py-1 rounded text-sm font-semibold">
                  {game.metacritic}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {game.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: game.description }}
                  />
                </div>
              )}

              {/* Platforms */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {game.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.slice(0, 10).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Game Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Game Details</h3>
                
                {game.released && (
                  <div>
                    <span className="text-sm text-gray-600">Release Date:</span>
                    <p className="font-medium">{new Date(game.released).toLocaleDateString()}</p>
                  </div>
                )}

                {game.developers.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Developer:</span>
                    <p className="font-medium">{game.developers.join(", ")}</p>
                  </div>
                )}

                {game.publishers.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Publisher:</span>
                    <p className="font-medium">{game.publishers.join(", ")}</p>
                  </div>
                )}

                {game.esrbRating && (
                  <div>
                    <span className="text-sm text-gray-600">ESRB Rating:</span>
                    <p className="font-medium">{game.esrbRating}</p>
                  </div>
                )}

                {game.playtime && (
                  <div>
                    <span className="text-sm text-gray-600">Average Playtime:</span>
                    <p className="font-medium">{game.playtime} hours</p>
                  </div>
                )}

                {game.userAddedAt && (
                  <div>
                    <span className="text-sm text-gray-600">Added to Collection:</span>
                    <p className="font-medium">{new Date(game.userAddedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {game.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                  >
                    Visit Website
                  </a>
                )}
                
                <button
                  onClick={handleRemoveGame}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Remove from Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
