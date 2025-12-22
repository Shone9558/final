import React, { createContext, useContext, useRef, useState, useEffect } from "react";

const AudioContext = createContext(null);

const MOOD_TRACKS = {
  happy: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  sad: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  relax: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  energetic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
};

export function AudioProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentMood, setCurrentMood] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  const playMood = async (mood) => {
    const url = MOOD_TRACKS[mood];
    if (!url) return;
    const audio = audioRef.current;
    if (audio.src !== url) {
      audio.src = url;
    }
    try {
      await audio.play();
      setCurrentMood(mood);
      setIsPlaying(true);
    } catch (e) {
      // autoplay might be blocked; still set state so UI knows which track was selected
      setCurrentMood(mood);
      setIsPlaying(false);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
  };

  const resume = async () => {
    const audio = audioRef.current;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentMood(null);
  };

  return (
    <AudioContext.Provider
      value={{
        playMood,
        pause,
        resume,
        stop,
        setVolume,
        volume,
        isPlaying,
        currentMood,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
