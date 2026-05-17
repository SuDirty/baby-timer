import { useCallback, useEffect, useState } from 'react';
import { Clock, Lock, Pause, Play, RotateCcw, Settings, Unlock, Volume2, VolumeX } from 'lucide-react';
import BackgroundSprites from './components/BackgroundSprites';
import SetupPanel from './components/SetupPanel';
import TimerVisual from './components/TimerVisual';
import UnlockChallenge from './components/UnlockChallenge';
import { DEFAULT_MINUTES, clampMinutes } from './constants';
import { useAudioAlerts } from './hooks/useAudioAlerts';
import { useIdleMode } from './hooks/useIdleMode';
import { useTimer } from './hooks/useTimer';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatClockTime = (date) => date.toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const createChallenge = () => {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { q: `${a} × ${b} = ?`, answer: a * b };
};

const TimeVisualizer = () => {
  const [showSetup, setShowSetup] = useState(true);
  const [setupMinutes, setSetupMinutes] = useState(DEFAULT_MINUTES);
  const [isLocked, setIsLocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showUnlockChallenge, setShowUnlockChallenge] = useState(false);
  const [challenge, setChallenge] = useState(() => createChallenge());
  const [inputAnswer, setInputAnswer] = useState('');
  const [challengeAttempt, setChallengeAttempt] = useState(0);

  const { initAudio, playSoundEffect } = useAudioAlerts(isMuted);
  const handleFinish = useCallback(() => {
    playSoundEffect('finish');
  }, [playSoundEffect]);

  const {
    totalTime,
    timeLeft,
    isRunning,
    isFinished,
    setDuration,
    start,
    pause,
    toggle,
    reset,
  } = useTimer({
    onAlert: playSoundEffect,
    onFinish: handleFinish,
  });

  const {
    now,
    isIdleMode,
    handleInteraction,
    resetIdleTimer,
  } = useIdleMode(isRunning);

  const isUrgent = isRunning && timeLeft <= 60 && timeLeft > 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const minParam = params.get('min');
    if (!minParam) return;

    const minutes = clampMinutes(minParam);
    setSetupMinutes(minutes);
    setDuration(minutes * 60);
    setShowSetup(false);
  }, [setDuration]);

  useEffect(() => {
    if (isFinished) resetIdleTimer();
  }, [isFinished, resetIdleTimer]);

  const handleStartSetup = () => {
    initAudio();
    const duration = setupMinutes * 60;
    setDuration(duration);
    setShowSetup(false);
    setIsLocked(false);
    start(duration);
  };

  const handleReset = () => {
    reset();
    resetIdleTimer();
  };

  const handleEdit = () => {
    pause();
    setShowSetup(true);
  };

  const handleLockClick = () => {
    if (!isLocked) {
      setIsLocked(true);
      return;
    }

    setChallenge(createChallenge());
    setInputAnswer('');
    setShowUnlockChallenge(true);
  };

  const handleNumberInput = (num) => {
    setInputAnswer((answer) => (answer.length < 3 ? `${answer}${num}` : answer));
  };

  const handleSubmitChallenge = () => {
    if (Number.parseInt(inputAnswer, 10) === challenge.answer) {
      setIsLocked(false);
      setShowUnlockChallenge(false);
      return;
    }

    setChallengeAttempt((attempt) => attempt + 1);
    setInputAnswer('');
  };

  return (
    <main
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans transition-colors duration-1000 ${
        isIdleMode ? 'bg-slate-950' : isUrgent ? 'bg-red-50' : 'bg-slate-50'
      }`}
      style={{ minHeight: 'var(--app-height, 100vh)' }}
      onClick={handleInteraction}
    >
      {!isIdleMode && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsMuted((muted) => !muted);
            }}
            className="absolute bottom-4 left-4 z-50 rounded-full bg-white/50 p-2 text-slate-400 backdrop-blur-sm transition-colors hover:text-slate-600"
            aria-label={isMuted ? '開啟聲音' : '靜音'}
            title={isMuted ? '開啟聲音' : '靜音'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <div className="absolute left-4 top-4 z-50 flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-slate-400 backdrop-blur-sm">
            <Clock size={16} aria-hidden="true" />
            <span className="font-mono text-lg font-bold">{formatClockTime(now)}</span>
          </div>
        </>
      )}

      {isUrgent && <div className="pointer-events-none absolute inset-0 animate-pulse bg-red-100 opacity-20" />}

      <BackgroundSprites isIdleMode={isIdleMode} />

      <div className="z-10 flex w-full max-w-md flex-col items-center p-4">
        {!isLocked && !isIdleMode && (
          <h1 className="mb-6 text-center text-3xl font-bold tracking-wide text-slate-700">
            時間小精靈
          </h1>
        )}

        <TimerVisual
          formatClockTime={formatClockTime}
          isFinished={isFinished}
          isIdleMode={isIdleMode}
          isRunning={isRunning}
          isUrgent={isUrgent}
          now={now}
          showSetup={showSetup}
          timeLeft={timeLeft}
          totalTime={totalTime}
        />

        {!isIdleMode && (
          <div className={`mb-6 font-mono transition-all duration-300 ${
            isUrgent ? 'animate-pulse text-5xl font-bold text-red-500' : 'text-4xl text-slate-500'
          } ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
            {formatTime(timeLeft)}
          </div>
        )}

        {showSetup && !isIdleMode ? (
          <SetupPanel setupMinutes={setupMinutes} setSetupMinutes={setSetupMinutes} onStart={handleStartSetup} />
        ) : (
          <div className={`w-full transition-all duration-500 ${isLocked || isIdleMode ? 'pointer-events-none translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={toggle}
                className={`transform rounded-full p-6 text-white shadow-lg transition-all active:scale-95 ${
                  isRunning ? 'bg-orange-400 hover:bg-orange-500' : 'bg-green-400 hover:bg-green-500'
                }`}
                aria-label={isRunning ? '暫停倒數' : '繼續倒數'}
              >
                {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </button>
              <button type="button" onClick={handleReset} className="transform rounded-full bg-slate-200 p-6 text-slate-600 shadow-lg transition-all hover:bg-slate-300 active:scale-95" aria-label="重設倒數">
                <RotateCcw size={32} />
              </button>
              <button type="button" onClick={handleEdit} className="transform rounded-full bg-slate-200 p-6 text-slate-600 shadow-lg transition-all hover:bg-slate-300 active:scale-95" aria-label="重新設定時間">
                <Settings size={32} />
              </button>
            </div>
          </div>
        )}

        {isIdleMode && (
          <div className="mt-4 animate-pulse text-sm tracking-wide text-slate-500">
            輕觸喚醒
          </div>
        )}
      </div>

      {!showSetup && !isIdleMode && (
        <div className="fixed right-4 top-4 z-40">
          <button
            type="button"
            onClick={handleLockClick}
            className={`rounded-full p-3 shadow-sm transition-all duration-300 ${
              isLocked ? 'bg-red-100 text-red-500 ring-2 ring-red-400 hover:bg-red-200' : 'bg-white text-slate-300 hover:text-slate-500'
            }`}
            aria-label={isLocked ? '進行家長驗證' : '開啟兒童鎖'}
            title={isLocked ? '點擊進行家長驗證' : '點擊開啟兒童鎖'}
          >
            {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
          </button>
        </div>
      )}

      {showUnlockChallenge && (
        <UnlockChallenge
          challenge={challenge}
          inputAnswer={inputAnswer}
          onBackspace={() => setInputAnswer((answer) => answer.slice(0, -1))}
          onClose={() => setShowUnlockChallenge(false)}
          onNumberInput={handleNumberInput}
          onSubmit={handleSubmitChallenge}
          shouldShake={challengeAttempt}
        />
      )}
    </main>
  );
};

export default TimeVisualizer;
