import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Episode } from '../types/index.js';
import { apiClient } from '../api/client.js';

interface AudioContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  position: number;       // in seconds
  duration: number;       // in seconds
  buffered: number;       // in seconds
  speed: number;          // 0.75, 1, 1.25, 1.5, 2
  isExpanded: boolean;
  isLoading: boolean;
  playEpisode: (episode: Episode) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setIsExpanded: (expanded: boolean) => void;
  formatTime: (seconds: number) => string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [buffered, setBuffered] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // Initialize HTML5 Audio instance
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!audio) return;
      setPosition(audio.currentTime);

      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }

      // Sync progress to backend every 5 seconds (only for subscribed / saved library episodes)
      const now = Date.now();
      if (
        now - lastSyncTimeRef.current > 5000 &&
        currentEpisodeRef.current &&
        !currentEpisodeRef.current.is_preview
      ) {
        lastSyncTimeRef.current = now;
        apiClient.saveProgress(
          currentEpisodeRef.current.id,
          audio.currentTime,
          audio.duration || currentEpisodeRef.current.duration_seconds || 0
        ).catch((err) => console.warn('Progress sync warning:', err));
      }
    };

    const handleLoadedMetadata = () => {
      if (!audio) return;
      const audioDuration = isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : currentEpisodeRef.current?.duration_seconds || 0;
      setDuration(audioDuration);
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (currentEpisodeRef.current && !currentEpisodeRef.current.is_preview) {
        apiClient.saveProgress(
          currentEpisodeRef.current.id,
          audio.currentTime,
          audio.duration || 0,
          true
        ).catch(console.warn);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.src = '';
    };
  }, []);

  const currentEpisodeRef = useRef<Episode | null>(currentEpisode);
  currentEpisodeRef.current = currentEpisode;

  const playEpisode = (episode: Episode) => {
    if (!audioRef.current) return;

    if (currentEpisode?.id === episode.id) {
      togglePlayPause();
      return;
    }

    setCurrentEpisode(episode);
    setIsLoading(true);
    setPosition(episode.position_seconds || 0);
    setDuration(episode.duration_seconds || 0);

    const audio = audioRef.current;
    audio.src = episode.audio_url;
    audio.playbackRate = speed;

    if (episode.position_seconds && episode.position_seconds > 0) {
      audio.currentTime = episode.position_seconds;
    }

    audio.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
    }).catch((err) => {
      console.warn('Playback play failed:', err);
      setIsLoading(false);
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentEpisode) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  const seekTo = (seconds: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, duration || 99999));
    audioRef.current.currentTime = clamped;
    setPosition(clamped);
  };

  const skipForward = (seconds = 30) => {
    if (!audioRef.current) return;
    seekTo(audioRef.current.currentTime + seconds);
  };

  const skipBackward = (seconds = 15) => {
    if (!audioRef.current) return;
    seekTo(audioRef.current.currentTime - seconds);
  };

  const setPlaybackSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (totalSeconds: number): string => {
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <AudioContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        position,
        duration,
        buffered,
        speed,
        isExpanded,
        isLoading,
        playEpisode,
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        setPlaybackSpeed,
        setIsExpanded,
        formatTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
