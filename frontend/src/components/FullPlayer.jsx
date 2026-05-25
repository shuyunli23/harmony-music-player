import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, 
  Repeat, Repeat1, ChevronDown, Music,
  ListPlus, Check, ListMusic
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { PlayerBackground, BackgroundSelector } from './PlayerBackgrounds';
import { formatTime, formatPlayCount } from '../utils/helpers';

/**
 * Add to Playlist Button for FullPlayer
 */
const AddToPlaylistButton = ({ track, playlists, onAddToPlaylist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adding, setAdding] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  const handleAdd = async (playlistId) => {
    setAdding(playlistId);
    try {
      await onAddToPlaylist(playlistId, track.id);
      setRecentlyAdded(true);
      setTimeout(() => {
        setIsOpen(false);
        setRecentlyAdded(false);
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAdding(null), 800);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 sm:p-3 rounded-full transition-all duration-300
          ${isOpen 
            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400' 
            : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Add to playlist"
      >
        <motion.div
          animate={recentlyAdded ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {recentlyAdded ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <ListPlus className="w-5 h-5" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-full mb-3 right-0 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
                <p className="text-sm font-medium text-white">Add to playlist</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{track.title}</p>
              </div>
              
              {/* Playlist list */}
              <div className="max-h-64 overflow-y-auto py-2">
                {(!playlists || playlists.length === 0) ? (
                  <div className="px-4 py-6 text-center">
                    <ListMusic className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No playlists yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Create one in Library</p>
                  </div>
                ) : (
                  playlists.map((playlist, index) => (
                    <motion.button
                      key={playlist.id}
                      onClick={() => handleAdd(playlist.id)}
                      disabled={adding === playlist.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-all flex items-center gap-3 group disabled:opacity-50"
                    >
                      {/* Playlist icon */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                        {adding === playlist.id ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                          </motion.div>
                        ) : (
                          <Music className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                        )}
                      </div>
                      
                      {/* Playlist info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-white transition-colors">
                          {playlist.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {playlist.track_count} track{playlist.track_count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Add indicator */}
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-400 text-lg leading-none">+</span>
                        </div>
                      </motion.div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const PlayModeIcon = ({ mode, className }) => {
  switch (mode) {
    case 'repeat-all':
      return <Repeat className={className} />;
    case 'repeat-one':
      return <Repeat1 className={className} />;
    case 'shuffle':
      return <Shuffle className={className} />;
    default: // sequential
      return <Repeat className={`${className} opacity-40`} />;
  }
};

/**
 * Progress slider with gradient fill on left side of thumb
 */
const ProgressSlider = ({ currentTime, duration, onSeek }) => {
  const percentage = duration ? (currentTime / duration) * 100 : 0;
  
  const sliderStyle = {
    background: `linear-gradient(to right, 
      #06b6d4 0%, 
      #10b981 ${percentage}%, 
      rgba(255, 255, 255, 0.2) ${percentage}%, 
      rgba(255, 255, 255, 0.2) 100%)`
  };

  return (
    <input 
      type="range" 
      min="0" 
      max={duration || 100} 
      value={currentTime} 
      onChange={(e) => onSeek(parseFloat(e.target.value))} 
      className="w-full h-1.5 cursor-pointer rounded-full appearance-none"
      style={sliderStyle}
    />
  );
};

const AlbumArtwork = ({ track, isPlaying, size = 'normal' }) => {
  const [imageError, setImageError] = React.useState(false);
  const token = localStorage.getItem('token');
  
  // Dynamic sizing based on available space
  const sizeClasses = {
    small: 'w-32 h-32 sm:w-40 sm:h-40',
    normal: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72',
    large: 'w-56 h-56 md:w-72 md:h-72'
  };
  
  if (track.cover_path && !imageError) {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden shadow-2xl relative flex-shrink-0`}
        animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img 
          src={`/api/music/${track.id}/cover?token=${encodeURIComponent(token)}`}
          alt={track.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        {/* Subtle overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-2xl overflow-hidden relative flex-shrink-0`}
      animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Music className="w-16 h-16 sm:w-20 sm:h-20 text-zinc-600" />
      {/* Animated gradient overlay when playing */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), transparent, rgba(6, 182, 212, 0.3))'
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

export default function FullPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  playMode,
  leftBars,
  rightBars,
  playlists,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onPlayModeToggle,
  onCollapse,
  onAddToPlaylist
}) {
  const [isCompact, setIsCompact] = useState(false);
  const [isVeryCompact, setIsVeryCompact] = useState(false);
  const [backgroundId, setBackgroundId] = useState(() => {
    return localStorage.getItem('playerBackground') || 'orbs';
  });

  const handleBackgroundChange = (id) => {
    setBackgroundId(id);
    localStorage.setItem('playerBackground', id);
  };

  // Detect viewport height and adjust layout
  useEffect(() => {
    const checkHeight = () => {
      const vh = window.innerHeight;
      setIsVeryCompact(vh < 500);
      setIsCompact(vh < 650);
    };

    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  const getModeColor = () => {
    if (playMode === 'sequential') return 'text-zinc-400';
    return 'text-emerald-400';
  };

  const getModeLabel = () => {
    switch (playMode) {
      case 'repeat-all': return 'Repeat All';
      case 'repeat-one': return 'Repeat One';
      case 'shuffle': return 'Shuffle';
      default: return 'Sequential';
    }
  };

  // Determine artwork size based on viewport
  const artworkSize = isVeryCompact ? 'small' : (isCompact ? 'small' : 'normal');

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden"
    >
      {/* Animated background */}
      <PlayerBackground backgroundId={backgroundId} isPlaying={isPlaying} />
      
      {/* Header - compact on small heights */}
      <div className={`relative z-20 flex items-center justify-between ${isVeryCompact ? 'p-2' : 'p-3 sm:p-4 md:p-6'}`}>
        <button 
          onClick={onCollapse} 
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <p className={`${isVeryCompact ? 'text-xs' : 'text-sm'} text-zinc-400 font-medium tracking-wide`}>Now Playing</p>
        <BackgroundSelector current={backgroundId} onChange={handleBackgroundChange} />
      </div>
      
      {/* Main content - scrollable on very small heights */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 overflow-y-auto ${isVeryCompact ? 'py-2 gap-2' : isCompact ? 'py-2 gap-3' : 'pb-6 gap-4'}`}>
        {/* Album art with glow effect */}
        <div className="relative flex-shrink-0">
          <AlbumArtwork track={track} isPlaying={isPlaying} size={artworkSize} />
          
          {/* Glow effect behind album art when playing */}
          {isPlaying && !isVeryCompact && (
            <motion.div
              className="absolute -inset-4 sm:-inset-6 rounded-3xl -z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.25))',
                filter: 'blur(25px)'
              }}
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [1, 1.03, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Track info */}
        <div className={`text-center max-w-md flex-shrink-0 ${isVeryCompact ? 'mb-0' : ''}`}>
          <motion.h2 
            className={`${isVeryCompact ? 'text-lg' : isCompact ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold mb-0.5 truncate px-4`}
            animate={isPlaying ? { opacity: [0.9, 1, 0.9] } : { opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {track.title}
          </motion.h2>
          <p className={`${isVeryCompact ? 'text-sm' : 'text-base md:text-lg'} text-zinc-400`}>{track.artist}</p>
          {track.album && !isVeryCompact && (
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{track.album}</p>
          )}
          {!isCompact && (
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              {formatPlayCount(track.play_count)} plays
            </p>
          )}
        </div>
        
        {/* Audio visualizer - hide on very compact */}
        {!isVeryCompact && (
          <div className={`w-full max-w-lg flex-shrink-0 ${isCompact ? 'h-12' : ''}`}>
            <AudioVisualizer 
              leftBars={leftBars} 
              rightBars={rightBars} 
              isPlaying={isPlaying}
              variant={isCompact ? "mini" : "full"}
            />
          </div>
        )}
        
        {/* Progress bar with gradient */}
        <div className={`w-full max-w-md flex-shrink-0 ${isVeryCompact ? 'mt-1' : ''}`}>
          <ProgressSlider 
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />
          <div className={`flex justify-between ${isVeryCompact ? 'text-xs mt-1' : 'text-sm mt-2'} text-zinc-400`}>
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className={`flex items-center ${isVeryCompact ? 'gap-4' : isCompact ? 'gap-5' : 'gap-6 md:gap-8'} flex-shrink-0`}>
          <button 
            onClick={onPlayModeToggle} 
            className={`${isVeryCompact ? 'p-2' : 'p-3'} rounded-full transition-all ${getModeColor()} hover:text-white hover:bg-white/10`}
            title={getModeLabel()}
          >
            <PlayModeIcon mode={playMode} className={`${isVeryCompact ? 'w-4 h-4' : 'w-5 h-5 md:w-6 md:h-6'}`} />
          </button>
          <button 
            onClick={onPrev} 
            className={`${isVeryCompact ? 'p-2' : 'p-3'} text-white hover:scale-110 hover:text-emerald-400 transition-all`}
          >
            <SkipBack className={`${isVeryCompact ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8'}`} />
          </button>
          <motion.button 
            onClick={onTogglePlay} 
            className={`${isVeryCompact ? 'w-12 h-12' : isCompact ? 'w-14 h-14' : 'w-16 h-16 md:w-20 md:h-20'} rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: isPlaying 
                ? '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)'
                : '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isPlaying ? (
              <Pause className={`${isVeryCompact ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8'} text-black`} />
            ) : (
              <Play className={`${isVeryCompact ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8'} text-black ml-1`} />
            )}
          </motion.button>
          <button 
            onClick={onNext} 
            className={`${isVeryCompact ? 'p-2' : 'p-3'} text-white hover:scale-110 hover:text-emerald-400 transition-all`}
          >
            <SkipForward className={`${isVeryCompact ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8'}`} />
          </button>
          
          {/* Add to Playlist Button */}
          {playlists && onAddToPlaylist && (
            <AddToPlaylistButton 
              track={track}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}