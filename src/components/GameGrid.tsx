import { Id } from "../../convex/_generated/dataModel";
import { GameDetailModal } from "./GameDetailModal";
import { useState } from "react";

interface Game {
  _id: Id<"games">;
  name: string;
  backgroundImage?: string;
  released?: string;
  rating?: number;
  metacritic?: number;
  platforms: string[];
  genres: string[];
  userAddedAt?: number;
}

interface GameGridProps {
  games: Game[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  onPlatformToggle: (platform: string) => void;
  onGenreToggle: (genre: string) => void;
}

export function GameGrid({ 
  games, 
  selectedPlatforms, 
  selectedGenres, 
  onPlatformToggle, 
  onGenreToggle 
}: GameGridProps) {
  const [selectedGameId, setSelectedGameId] = useState<Id<"games"> | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedGameId(game._id)}
          >
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {game.rating && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {game.rating.toFixed(1)}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{game.name}</h3>
              
              {game.released && (
                <p className="text-sm text-gray-600 mb-3">
                  {new Date(game.released).getFullYear()}
                </p>
              )}

              {/* Platforms */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {game.platforms.slice(0, 3).map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlatformToggle(platform);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {platform}
                      </button>
                    );
                  })}
                  {game.platforms.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{game.platforms.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Genres */}
              <div>
                <div className="flex flex-wrap gap-1">
                  {game.genres.slice(0, 2).map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenreToggle(genre);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                  {game.genres.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{game.genres.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGameId && (
        <GameDetailModal
          gameId={selectedGameId}
          onClose={() => setSelectedGameId(null)}
        />
      )}
    </>
  );
}
