import { useCallback, useRef } from 'react';

const ALERT_TONES = {
  '15min': [[880, 'sine', 1.5, 0]],
  '5min': [
    [660, 'sine', 0.3, 0],
    [660, 'sine', 0.8, 0.4],
  ],
  '3min': [
    [550, 'triangle', 0.2, 0],
    [550, 'triangle', 0.2, 0.3],
    [550, 'triangle', 0.6, 0.6],
  ],
  '1min': [
    [440, 'sawtooth', 0.1, 0],
    [440, 'sawtooth', 0.1, 0.2],
    [880, 'sine', 1, 0.4],
  ],
  finish: [
    [523.25, 'square', 0.2, 0],
    [659.25, 'square', 0.2, 0.2],
    [783.99, 'square', 0.2, 0.4],
    [1046.5, 'sine', 1.5, 0.6],
  ],
};

export const useAudioAlerts = (isMuted) => {
  const audioCtxRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq, type, duration, startTime = 0) => {
    if (isMuted || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const toneStart = ctx.currentTime + startTime;
    const toneEnd = toneStart + duration;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, toneStart);
    gain.gain.setValueAtTime(0.1, toneStart);
    gain.gain.exponentialRampToValueAtTime(0.001, toneEnd);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(toneStart);
    osc.stop(toneEnd);
  }, [isMuted]);

  const playSoundEffect = useCallback((scenario) => {
    if (isMuted) return;
    initAudio();

    ALERT_TONES[scenario]?.forEach(([freq, type, duration, startTime]) => {
      playTone(freq, type, duration, startTime);
    });
  }, [initAudio, isMuted, playTone]);

  return { initAudio, playSoundEffect };
};
