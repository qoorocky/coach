"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicTrack } from "@coach/shared-types";
import { onSpeechActive } from "./speech";

export interface MusicPlayer {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  duckLevel: number; // 1.0 = full, 0.2 = ducked
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  duck: () => void;
  unduck: () => void;
}

const DUCK_VOLUME = 0.2;
const FULL_VOLUME = 0.8;

export function useMusicPlayer(tracks: MusicTrack[]): MusicPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duckLevel, setDuckLevel] = useState(FULL_VOLUME);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = FULL_VOLUME;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const onEnded = () => {
      // sequential loop through the workout's track list
      setIndex((i) => (tracks.length === 0 ? 0 : (i + 1) % tracks.length));
    };
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // tracks length intentionally part of deps so cleanup ticks if list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  // Load src whenever the active track changes; resume play if we were playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = tracks[index];
    if (!track) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    if (audio.src !== track.fileUrl) {
      audio.src = track.fileUrl;
    }
    if (isPlaying) {
      audio.play().catch(() => {
        // autoplay rejected; will be unblocked by next user gesture
      });
    }
  }, [index, tracks, isPlaying]);

  // Apply duckLevel to the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = duckLevel;
  }, [duckLevel]);

  // Auto-duck while speech synth is speaking
  useEffect(() => {
    return onSpeechActive((speaking) =>
      setDuckLevel(speaking ? DUCK_VOLUME : FULL_VOLUME),
    );
  }, []);

  function start() {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    if (!audio.src && tracks[0]) audio.src = tracks[0].fileUrl;
    audio.play().then(
      () => setIsPlaying(true),
      () => {
        // ignored — expected when called outside user gesture
      },
    );
  }

  function pause() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  function resume() {
    audioRef.current?.play().then(
      () => setIsPlaying(true),
      () => {},
    );
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }

  function next() {
    if (tracks.length === 0) return;
    setIndex((i) => (i + 1) % tracks.length);
  }

  function duck() {
    setDuckLevel(DUCK_VOLUME);
  }

  function unduck() {
    setDuckLevel(FULL_VOLUME);
  }

  return {
    currentTrack: tracks[index] ?? null,
    isPlaying,
    duckLevel,
    start,
    pause,
    resume,
    stop,
    next,
    duck,
    unduck,
  };
}
