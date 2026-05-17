import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_MINUTES } from '../constants';

const ALERT_THRESHOLDS = new Map([
  [15 * 60, '15min'],
  [5 * 60, '5min'],
  [3 * 60, '3min'],
  [60, '1min'],
]);

const getRemainingSeconds = (endTime) => Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

const getTriggeredThresholds = (secondsLeft) => new Set(
  [...ALERT_THRESHOLDS.keys()].filter((threshold) => secondsLeft <= threshold)
);

export const useTimer = ({ onAlert, onFinish }) => {
  const initialSeconds = DEFAULT_MINUTES * 60;
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const endTimeRef = useRef(null);
  const timeLeftRef = useRef(initialSeconds);
  const triggeredAlertsRef = useRef(new Set());

  const setDuration = useCallback((seconds) => {
    timeLeftRef.current = seconds;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsFinished(false);
    setIsRunning(false);
    endTimeRef.current = null;
    triggeredAlertsRef.current = new Set();
  }, []);

  const start = useCallback((secondsOverride) => {
    const secondsToRun = secondsOverride ?? timeLeft;
    if (secondsToRun <= 0) return;

    timeLeftRef.current = secondsToRun;
    setIsFinished(false);
    setTimeLeft(secondsToRun);
    setIsRunning(true);
    endTimeRef.current = Date.now() + secondsToRun * 1000;
  }, [timeLeft]);

  const pause = useCallback(() => {
    if (endTimeRef.current) {
      const remainingSeconds = getRemainingSeconds(endTimeRef.current);
      timeLeftRef.current = remainingSeconds;
      setTimeLeft(remainingSeconds);
    }

    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else if (timeLeft > 0) {
      start();
    }
  }, [isRunning, pause, start, timeLeft]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    timeLeftRef.current = totalTime;
    setTimeLeft(totalTime);
    endTimeRef.current = null;
    triggeredAlertsRef.current = new Set();
  }, [totalTime]);

  const restore = useCallback((snapshot) => {
    const restoredTotalTime = Number(snapshot?.totalTime);
    const restoredTimeLeft = Number(snapshot?.timeLeft);
    const restoredEndTime = Number(snapshot?.endTime);
    const total = Number.isFinite(restoredTotalTime) && restoredTotalTime > 0
      ? restoredTotalTime
      : initialSeconds;

    let nextTimeLeft = Number.isFinite(restoredTimeLeft)
      ? Math.min(total, Math.max(0, restoredTimeLeft))
      : total;

    if (snapshot?.isRunning && Number.isFinite(restoredEndTime)) {
      nextTimeLeft = Math.min(total, getRemainingSeconds(restoredEndTime));
    }

    const shouldRun = Boolean(snapshot?.isRunning && nextTimeLeft > 0);
    const shouldFinish = Boolean(snapshot?.isFinished || (snapshot?.isRunning && nextTimeLeft <= 0));

    setTotalTime(total);
    setTimeLeft(nextTimeLeft);
    setIsRunning(shouldRun);
    setIsFinished(shouldFinish);
    timeLeftRef.current = nextTimeLeft;
    endTimeRef.current = shouldRun ? restoredEndTime : null;
    triggeredAlertsRef.current = getTriggeredThresholds(nextTimeLeft);
  }, [initialSeconds]);

  const getSnapshot = useCallback(() => ({
    totalTime,
    timeLeft: timeLeftRef.current,
    isRunning,
    isFinished,
    endTime: endTimeRef.current,
  }), [isFinished, isRunning, totalTime]);

  useEffect(() => {
    if (!isRunning || !endTimeRef.current) return undefined;

    const tick = () => {
      if (!endTimeRef.current) return;

      const nextTime = getRemainingSeconds(endTimeRef.current);
      const previousTime = timeLeftRef.current;

      ALERT_THRESHOLDS.forEach((scenario, threshold) => {
        if (
          nextTime <= threshold &&
          previousTime > threshold &&
          !triggeredAlertsRef.current.has(threshold)
        ) {
          triggeredAlertsRef.current.add(threshold);
          onAlert(scenario);
        }
      });

      timeLeftRef.current = nextTime;
      setTimeLeft(nextTime);

      if (nextTime <= 0) {
        setIsRunning(false);
        setIsFinished(true);
        endTimeRef.current = null;
        onFinish();
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [isRunning, onAlert, onFinish]);

  return {
    totalTime,
    timeLeft,
    isRunning,
    isFinished,
    setDuration,
    start,
    pause,
    toggle,
    reset,
    restore,
    getSnapshot,
  };
};
