import React, { useState } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface TrackRowProps {
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

const TrackRow: React.FC<TrackRowProps> = ({
  title,
  artist,
  duration,
  thumbnail,
  isPlaying = false,
  onPlayPause = () => {},
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-zinc-900/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-12 h-12 rounded object-cover"
        />
        <button
          onClick={onPlayPause}
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity rounded
            ${isHovered || isPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          {isPlaying ? (
            <PauseIcon className="w-6 h-6 text-white" />
          ) : (
            <PlayIcon className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <div className="flex-grow">
        <h3 className="font-bold text-white uppercase">{title}</h3>
        <p className="text-sm text-[#9eff00]">{artist}</p>
      </div>

      <span className="text-sm text-gray-400">{duration}</span>
    </div>
  );
};

// Example usage with multiple tracks
const TrackList: React.FC = () => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const tracks = [
    {
      id: '1',
      title: 'SAD',
      artist: 'Kaytranada',
      duration: '03:44',
      thumbnail: '/api/placeholder/48/48',
    },
    {
      id: '2',
      title: 'ONE OF WUN',
      artist: 'Kaytranada',
      duration: '03:44',
      thumbnail: '/api/placeholder/48/48',
    },
  ];

  return (
    <div className="bg-black min-h-screen p-6">
      {tracks.map((track) => (
        <TrackRow
          key={track.id}
          title={track.title}
          artist={track.artist}
          duration={track.duration}
          thumbnail={track.thumbnail}
          isPlaying={playingTrackId === track.id}
          onPlayPause={() => {
            setPlayingTrackId(playingTrackId === track.id ? null : track.id);
          }}
        />
      ))}
    </div>
  );
};

export default TrackList;