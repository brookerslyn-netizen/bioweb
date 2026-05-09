import { useState, useEffect } from "react";
import { Music, ExternalLink, Clock, Play, Pause } from "lucide-react";
import { Reveal, Doodle } from "./parts";

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  playedAt: string;
  duration: number;
}

interface SpotifyRecentProps {
  apiBase: string;
}

export function SpotifyRecent({ apiBase }: SpotifyRecentProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentTracks();
  }, [apiBase]);

  const fetchRecentTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/spotify/recent`);
      
      if (response.status === 401) {
        setConnected(false);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch tracks");
      }
      
      const data = await response.json();
      setTracks(data.tracks || []);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const played = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - played.getTime()) / 1000 / 60);
    
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <section className="py-4">
        <Reveal>
          <div className="paper p-4">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 paper-text" />
              <h2 className="text-xl font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                recently played
              </h2>
            </div>
            <div className="text-center py-8 paper-text-muted italic">
              loading tracks...
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  if (!connected) {
    return (
      <section className="py-4">
        <Reveal>
          <div className="paper p-4">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 paper-text" />
              <h2 className="text-xl font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                recently played
              </h2>
            </div>
            <div className="text-center py-6 paper-text-muted">
              <p className="mb-2">Spotify not connected</p>
              <p className="text-sm">Connect Spotify in admin panel to see recent tracks</p>
            </div>
            <Doodle kind="heart" top="15%" left="85%" size={16} rotate={10} />
            <Doodle kind="arrow" top="80%" left="5%" size={14} rotate={-20} />
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <section className="py-4">
      <Reveal>
        <div className="paper p-4">
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 paper-text" />
            <h2 className="text-xl font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              recently played
            </h2>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-6 paper-text-muted italic">
              no recent tracks - go listen to some music!
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.slice(0, 8).map((track, index) => (
                <div key={track.id}>
                  <div
                    className="flex items-center gap-3 p-2 rounded transition-all hover:opacity-80 cursor-pointer group"
                    style={{ 
                      background: index % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent',
                      transform: `rotate(${(Math.random() * 1 - 0.5)}deg)`
                    }}
                    onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                  >
                    <div className="relative flex-shrink-0">
                      {track.image && (
                        <img 
                          src={track.image} 
                          alt={track.album}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {playingTrack === track.id ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium paper-text truncate text-sm" style={{ fontFamily: "'Indie Flower', cursive" }}>
                        {track.name}
                      </div>
                      <div className="text-xs paper-text-muted truncate">
                        {track.artist}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs paper-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(track.playedAt)}
                      </span>
                      <a
                        href={`https://open.spotify.com/track/${track.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-black/10 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 paper-text-muted" />
                      </a>
                    </div>
                  </div>
                  {playingTrack === track.id && (
                    <div className="mt-2 rounded overflow-hidden" style={{ transform: `rotate(${(Math.random() * 0.5 - 0.25)}deg)` }}>
                      <iframe
                        src={`https://open.spotify.com/embed/track/${track.id}?theme=0`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="encrypted-media"
                        className="rounded"
                        style={{ background: 'transparent' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Doodle kind="heart" top="10%" left="90%" size={18} rotate={15} />
          <Doodle kind="arrow" top="85%" left="8%" size={16} rotate={-25} />
        </div>
      </Reveal>
    </section>
  );
}
