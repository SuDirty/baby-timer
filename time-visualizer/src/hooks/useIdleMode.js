import { useCallback, useEffect, useRef, useState } from 'react';
import { IDLE_TIMEOUT_MS } from '../constants';

export const useIdleMode = (isRunning) => {
  const [now, setNow] = useState(() => new Date());
  const [isIdleMode, setIsIdleMode] = useState(false);
  const lastInteractionRef = useRef(Date.now());

  const resetIdleTimer = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  const handleInteraction = useCallback(() => {
    resetIdleTimer();
    setIsIdleMode(false);
  }, [resetIdleTimer]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());

      if (!isRunning && Date.now() - lastInteractionRef.current > IDLE_TIMEOUT_MS) {
        setIsIdleMode(true);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'touchstart', 'click', 'keydown'];
    events.forEach((event) => window.addEventListener(event, handleInteraction, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleInteraction));
    };
  }, [handleInteraction]);

  return {
    now,
    isIdleMode,
    handleInteraction,
    resetIdleTimer,
  };
};
