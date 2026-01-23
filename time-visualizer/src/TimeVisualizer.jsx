import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Play, Pause, RotateCcw, Settings, Check, X, Delete, Clock, Volume2, VolumeX } from 'lucide-react';

const TimeVisualizer = () => {
  // --- 狀態管理 ---
  const [totalTime, setTotalTime] = useState(60 * 10);
  const [timeLeft, setTimeLeft] = useState(60 * 10);
  const [isRunning, setIsRunning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [setupMinutes, setSetupMinutes] = useState(10);
  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // 靜音控制

  // 當前時間與閒置模式
  const [now, setNow] = useState(new Date());
  const [isIdleMode, setIsIdleMode] = useState(false);
  const lastInteractionRef = useRef(Date.now());
  const IDLE_TIMEOUT = 30000; // 閒置 30 秒進入時鐘模式

  // 解鎖挑戰相關狀態
  const [showUnlockChallenge, setShowUnlockChallenge] = useState(false);
  const [challenge, setChallenge] = useState({ q: '', answer: 0 });
  const [inputAnswer, setInputAnswer] = useState('');

  // 緊張感狀態
  const isUrgent = isRunning && timeLeft <= 60 && timeLeft > 0;

  // --- 音效系統 (Web Audio API) ---
  const audioCtxRef = useRef(null);

  // 初始化 AudioContext
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // 播放單音
  const playTone = (freq, type, duration, startTime = 0) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  // 定義各種場景的音效
  const playSoundEffect = (scenario) => {
    if (isMuted) return;
    initAudio(); 

    switch (scenario) {
      case '15min': 
        playTone(880, 'sine', 1.5);
        break;
      case '5min': 
        playTone(660, 'sine', 0.3, 0);
        playTone(660, 'sine', 0.8, 0.4);
        break;
      case '3min':
        playTone(550, 'triangle', 0.2, 0);
        playTone(550, 'triangle', 0.2, 0.3);
        playTone(550, 'triangle', 0.6, 0.6);
        break;
      case '1min': 
        playTone(440, 'sawtooth', 0.1, 0);
        playTone(440, 'sawtooth', 0.1, 0.2);
        playTone(880, 'sine', 1.0, 0.4);
        break;
      case 'finish': 
        playTone(523.25, 'square', 0.2, 0);   
        playTone(659.25, 'square', 0.2, 0.2); 
        playTone(783.99, 'square', 0.2, 0.4); 
        playTone(1046.50, 'sine', 1.5, 0.6);  
        break;
      default:
        break;
    }
  };

  // --- 1. 時間與閒置偵測 ---
  useEffect(() => {
    const timer = setInterval(() => {
      const currentDate = new Date();
      setNow(currentDate);
      if (!isRunning && !isIdleMode) {
        if (Date.now() - lastInteractionRef.current > IDLE_TIMEOUT) {
          setIsIdleMode(true);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, isIdleMode]);

  const handleInteraction = () => {
    lastInteractionRef.current = Date.now();
    if (isIdleMode) setIsIdleMode(false);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'touchstart', 'click', 'keydown'];
    const handler = () => handleInteraction();
    events.forEach(event => window.addEventListener(event, handler));
    return () => events.forEach(event => window.removeEventListener(event, handler));
  }, [isIdleMode]);

  // --- 2. 既有計時器邏輯 + 音效觸發 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const minParam = params.get('min');
    if (minParam && !isNaN(minParam)) {
      const minutes = parseInt(minParam, 10);
      setSetupMinutes(minutes);
      setTotalTime(minutes * 60);
      setTimeLeft(minutes * 60);
      setShowSetup(false);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const nextTime = prev - 1;
          
          if (nextTime === 15 * 60) playSoundEffect('15min');
          if (nextTime === 5 * 60)  playSoundEffect('5min');
          if (nextTime === 3 * 60)  playSoundEffect('3min');
          if (nextTime === 1 * 60)  playSoundEffect('1min');
          
          if (nextTime <= 0) {
            setIsFinished(true);
            setIsRunning(false);
            playSoundEffect('finish');
            
            // --- 關鍵修正：倒數結束時，重置閒置計時器 ---
            // 這樣可以確保慶祝畫面停留 IDLE_TIMEOUT (30秒) 後才進入時鐘模式
            lastInteractionRef.current = Date.now();
            
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // --- 3. 數學挑戰邏輯 ---
  const generateChallenge = () => {
    const a = Math.floor(Math.random() * 8) + 2; 
    const b = Math.floor(Math.random() * 8) + 2; 
    setChallenge({ q: `${a} × ${b} = ?`, answer: a * b });
    setInputAnswer('');
    setShowUnlockChallenge(true);
  };

  const handleNumberInput = (num) => {
    if (inputAnswer.length < 3) setInputAnswer(prev => prev + num);
  };

  const handleBackspace = () => {
    setInputAnswer(prev => prev.slice(0, -1));
  };

  const handleSubmitChallenge = () => {
    if (parseInt(inputAnswer) === challenge.answer) {
      setIsLocked(false);
      setShowUnlockChallenge(false);
    } else {
      const modal = document.getElementById('challenge-modal');
      modal.classList.add('animate-shake');
      setTimeout(() => {
        modal.classList.remove('animate-shake');
        setShowUnlockChallenge(false);
      }, 500);
    }
  };

  // --- 4. 按鈕處理 ---
  const handleStartSetup = () => {
    initAudio(); 
    const seconds = setupMinutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsFinished(false);
    setShowSetup(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalTime);
  };

  const handleEdit = () => {
    setIsRunning(false);
    setShowSetup(true);
  };

  const handleLockClick = () => {
    if (!isLocked) setIsLocked(true);
    else generateChallenge();
  };

  // --- 5. 視覺化繪圖 Helper ---
  const getPiePath = (cx, cy, radius, startAngle, endAngle) => {
    const start = (startAngle - 90) * (Math.PI / 180);
    const end = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatClockTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // 視覺化參數
  const baseRadius = 120;
  const ringGap = 18;
  const outerStrokeWidth = 12;
  const secondRingRadius = 75;
  const secondRingStrokeWidth = 6;

  // --- 渲染主要視覺 ---
  const renderVisuals = () => {
    const elements = [];
    const center = { x: 160, y: 160 };

    // --- A. 時鐘模式 ---
    if (isIdleMode) {
        const seconds = now.getSeconds();
        const secondsProgress = seconds / 60;
        const secondsCircumference = 2 * Math.PI * baseRadius; 
        const secondsDashOffset = secondsCircumference * (1 - secondsProgress);

        elements.push(<circle key="clock-bg" cx={center.x} cy={center.y} r={baseRadius} fill="#1e293b" stroke="#334155" strokeWidth="4" />);
        elements.push(
            <circle key="clock-seconds" cx={center.x} cy={center.y} r={baseRadius} fill="none" stroke="#38bdf8" strokeWidth="6" strokeDasharray={secondsCircumference} strokeDashoffset={secondsDashOffset} strokeLinecap="round" className="transition-all duration-1000 linear origin-center -rotate-90" style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 4px #38bdf8)' }} />
        );
        return elements;
    }

    // --- B. 計時模式 ---
    if (timeLeft > 0) {
        const secondsValue = timeLeft % 60;
        const effectiveSeconds = (timeLeft > 0 && secondsValue === 0) ? 60 : secondsValue;
        const secondsProgress = effectiveSeconds / 60;
        const secondsCircumference = 2 * Math.PI * secondRingRadius;
        const secondsDashOffset = secondsCircumference * (1 - secondsProgress);
        const secondsColor = isUrgent ? '#EF4444' : '#64748B';

        elements.push(
          <g key="seconds-ring" className="z-20">
            <circle cx={center.x} cy={center.y} r={secondRingRadius} fill="none" stroke={secondsColor} strokeWidth={secondRingStrokeWidth} strokeOpacity="0.1" />
            <circle cx={center.x} cy={center.y} r={secondRingRadius} fill="none" stroke={secondsColor} strokeWidth={secondRingStrokeWidth} strokeDasharray={secondsCircumference} strokeDashoffset={secondsDashOffset} strokeLinecap="round" className={`transition-all duration-1000 linear origin-center -rotate-90 ${isUrgent ? 'animate-heartbeat' : ''}`} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </g>
        );
    }

    const totalHoursNeeded = Math.ceil(totalTime / 3600);
    for (let i = totalHoursNeeded - 1; i >= 0; i--) {
      const ringStartSeconds = i * 3600;
      const ringEndSeconds = (i + 1) * 3600;
      
      const normalColors = ['#FCD34D', '#F472B6', '#60A5FA', '#34D399', '#A78BFA'];
      let color = normalColors[i % normalColors.length];
      
      const isActiveLayer = timeLeft > ringStartSeconds && timeLeft <= ringEndSeconds;
      if (isUrgent && isActiveLayer) color = '#EF4444';

      if (i === 0) { 
        let angle = 0;
        if (timeLeft >= 3600) angle = 360;
        else if (timeLeft <= 0) angle = 0;
        else angle = (timeLeft / 3600) * 360;

        if (angle > 0) {
            elements.push(<circle key="pie-bg" cx={center.x} cy={center.y} r={baseRadius} fill={color} fillOpacity="0.1" />);
            if (angle > 359.9) {
                 elements.push(<circle key="pie-full" cx={center.x} cy={center.y} r={baseRadius} fill={color} className={`transition-all duration-500 ease-in-out ${isUrgent ? 'animate-heartbeat' : ''}`} />);
            } else {
                elements.push(<path key="pie-slice" d={getPiePath(center.x, center.y, baseRadius, 0, angle)} fill={color} className={`transition-all duration-500 ease-in-out ${isUrgent ? 'animate-heartbeat' : ''}`} />);
            }
        }
      } else {
        const radius = baseRadius + (i * ringGap);
        const circumference = 2 * Math.PI * radius;
        let progress = 0;
        if (timeLeft >= ringEndSeconds) progress = 1;
        else if (timeLeft <= ringStartSeconds) progress = 0;
        else progress = (timeLeft - ringStartSeconds) / 3600;
        const dashOffset = circumference * (1 - progress);

        elements.push(
            <g key={`ring-${i}`}>
            <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke={color} strokeWidth={outerStrokeWidth} strokeOpacity="0.2" strokeLinecap="round" />
            <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke={color} strokeWidth={outerStrokeWidth} strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 linear origin-center -rotate-90" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </g>
        );
      }
    }
    return elements;
  };

  const BackgroundAnimal = ({ emoji, animationClass, style }) => (
    <div className={`absolute text-4xl opacity-30 pointer-events-none select-none ${animationClass}`} style={style}>
      {emoji}
    </div>
  );

  return (
    <div 
        className={`flex flex-col items-center justify-center font-sans select-none overflow-hidden relative transition-colors duration-1000 
        ${isIdleMode ? 'bg-slate-950' : (isUrgent ? 'bg-red-50' : 'bg-slate-50')}`}
        style={{ minHeight: 'var(--app-height, 100vh)' }}
        onClick={handleInteraction}
    >
      
      {/* 音量控制 (左下角) */}
      {!isIdleMode && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="absolute bottom-4 left-4 z-50 p-2 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full backdrop-blur-sm transition-colors"
          title={isMuted ? "開啟聲音" : "靜音"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}

      {/* 左上角常駐時間 */}
      {!isIdleMode && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 text-slate-400 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
          <Clock size={16} />
          <span className="font-mono font-bold text-lg">{formatClockTime(now)}</span>
        </div>
      )}

      {isUrgent && (
        <div className="absolute inset-0 bg-red-100 opacity-20 animate-pulse pointer-events-none" />
      )}

      {/* 背景動物 */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${isIdleMode ? 'opacity-20' : 'opacity-100'}`}>
        <BackgroundAnimal emoji="🐱" animationClass="animate-float-slow" style={{ top: '10%', left: '10%', animationDelay: '0s' }} />
        <BackgroundAnimal emoji="🐶" animationClass="animate-float-medium" style={{ top: '20%', right: '15%', animationDelay: '1s' }} />
        <BackgroundAnimal emoji="🐦" animationClass="animate-fly-across" style={{ top: '5%', left: '-5%', animationDuration: '15s' }} />
        <BackgroundAnimal emoji="🦋" animationClass="animate-flutter" style={{ bottom: '25%', left: '20%', animationDelay: '0.5s' }} />
        <BackgroundAnimal emoji="🐢" animationClass="animate-float-slow" style={{ bottom: '10%', right: '10%', animationDelay: '2s' }} />
        <BackgroundAnimal emoji="🦄" animationClass="animate-pulse-slow" style={{ top: '50%', left: '5%', animationDelay: '1.5s' }} />
        <BackgroundAnimal emoji="🐘" animationClass="animate-bounce-slow" style={{ bottom: '5%', left: '50%', animationDelay: '3s' }} />
        <BackgroundAnimal emoji="🦒" animationClass="animate-float-medium" style={{ top: '15%', left: '60%', animationDelay: '2.5s' }} />
      </div>

      <div className="z-10 w-full max-w-md p-4 flex flex-col items-center">
        
        {!isLocked && !isIdleMode && (
          <h1 className="text-3xl font-bold text-slate-700 mb-6 text-center tracking-wider">
            時間小精靈
          </h1>
        )}

        <div className="relative w-80 h-80 mb-8 flex items-center justify-center">
          {isFinished && !isIdleMode && (
            <div className="absolute inset-0 flex items-center justify-center z-20 flex-col animate-bounce">
              <span className="text-6xl">🎉</span>
              <span className="text-2xl font-bold text-slate-700 bg-white/80 px-4 py-1 rounded-full mt-2 shadow-sm">
                時間到囉！
              </span>
            </div>
          )}

          <svg className="w-full h-full transform drop-shadow-xl" viewBox="0 0 320 320">
            {renderVisuals()}
            
            <foreignObject x={isIdleMode ? "0" : "60"} y={isIdleMode ? "0" : "60"} width={isIdleMode ? "320" : "200"} height={isIdleMode ? "320" : "200"}>
              <div className="w-full h-full flex items-center justify-center flex-col">
                {isIdleMode ? (
                   <div className="font-mono font-bold flex flex-col items-center justify-center">
                     <span className="text-7xl tracking-widest text-slate-100 drop-shadow-lg leading-tight">{formatClockTime(now)}</span>
                     <span className="text-lg text-slate-400 mt-2 font-sans tracking-wide">{now.toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'short' })}</span>
                   </div>
                ) : (
                   <>
                       <div className="mb-2">
                        {isFinished ? (
                            <div className="text-6xl animate-spin-slow">🐰</div>
                            ) : isRunning ? (
                            isUrgent ? (
                                <div className="text-7xl animate-wobble-fast">🏃</div>
                            ) : (
                                <div className="text-6xl animate-pulse">🐢</div>
                            )
                            ) : (
                            <div className="text-6xl opacity-80">😴</div>
                            )
                        }
                       </div>
                   </>
                )}
              </div>
            </foreignObject>
          </svg>
        </div>

        {!isIdleMode && (
            <div className={`font-mono mb-6 transition-all duration-300 
            ${isUrgent ? 'text-5xl text-red-500 font-bold animate-pulse' : 'text-4xl text-slate-500'} 
            ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
            {formatTime(timeLeft)}
            </div>
        )}

        {showSetup && !isIdleMode ? (
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full border-4 border-yellow-100">
            <label className="block text-slate-600 font-bold mb-4 text-center text-lg">設定時間 (分鐘)</label>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setSetupMinutes(Math.max(1, setupMinutes - 5))} className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">-5</button>
              <button onClick={() => setSetupMinutes(Math.max(1, setupMinutes - 1))} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">-1</button>
              <span className="text-4xl font-bold text-slate-700 w-24 text-center">{setupMinutes}</span>
              <button onClick={() => setSetupMinutes(setupMinutes + 1)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">+1</button>
              <button onClick={() => setSetupMinutes(setupMinutes + 5)} className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">+5</button>
            </div>
            <button onClick={handleStartSetup} className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold text-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={28} />開始倒數</button>
          </div>
        ) : (
          <div className={`transition-all duration-500 w-full ${isLocked || isIdleMode ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsRunning(!isRunning)} className={`p-6 rounded-full shadow-lg transform active:scale-95 transition-all text-white ${isRunning ? 'bg-orange-400 hover:bg-orange-500' : 'bg-green-400 hover:bg-green-500'}`}>
                {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </button>
              <button onClick={handleReset} className="p-6 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 shadow-lg transform active:scale-95 transition-all"><RotateCcw size={32} /></button>
              <button onClick={handleEdit} className="p-6 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 shadow-lg transform active:scale-95 transition-all"><Settings size={32} /></button>
            </div>
          </div>
        )}
        
        {isIdleMode && (
            <div className="text-slate-500 animate-pulse mt-4 text-sm tracking-wide">
                輕觸喚醒
            </div>
        )}

      </div>

      {!showSetup && !isIdleMode && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={handleLockClick}
            className={`p-3 rounded-full transition-all duration-300 shadow-sm ${isLocked ? 'bg-red-100 text-red-500 hover:bg-red-200 ring-2 ring-red-400' : 'bg-white text-slate-300 hover:text-slate-500'}`}
            title={isLocked ? "點擊進行家長驗證" : "點擊開啟兒童鎖"}
          >
            {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
          </button>
        </div>
      )}

      {showUnlockChallenge && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm px-4">
          <div id="challenge-modal" className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-[320px] border-4 border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-slate-700">家長解鎖</h3>
              <button onClick={() => setShowUnlockChallenge(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl mb-4 flex items-center justify-between border-2 border-slate-200">
               <span className="text-xl font-bold text-slate-500">{challenge.q}</span>
               <span className="text-2xl font-bold text-blue-600 tracking-wider min-w-[60px] text-right border-b-2 border-blue-200">
                 {inputAnswer || '?'}
               </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} onClick={() => handleNumberInput(num.toString())} className="py-3 text-xl font-bold bg-white border-2 border-slate-100 hover:bg-blue-50 hover:border-blue-200 text-slate-600 rounded-lg active:scale-95 transition-all">{num}</button>
              ))}
              <button onClick={handleBackspace} className="py-3 text-slate-400 bg-slate-50 border-2 border-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center active:scale-95 transition-all"><Delete size={20} /></button>
              <button onClick={() => handleNumberInput('0')} className="py-3 text-xl font-bold bg-white border-2 border-slate-100 hover:bg-blue-50 hover:border-blue-200 text-slate-600 rounded-lg active:scale-95 transition-all">0</button>
              <button onClick={handleSubmitChallenge} className="py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 active:scale-95 transition-all">OK</button>
            </div>
            <p className="text-xs text-center text-slate-300 mt-4">請計算答案以解鎖</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-medium { 0%, 100% { transform: translateY(0px) rotate(5deg); } 50% { transform: translateY(-15px) rotate(-5deg); } }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.5; } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fly-across { from { transform: translateX(-10vw) translateY(0); } to { transform: translateX(110vw) translateY(-20px); } }
        @keyframes flutter { 0%, 100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(5px) rotate(5deg); } 50% { transform: translateX(0) rotate(0deg); } 75% { transform: translateX(-5px) rotate(-5deg); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes heartbeat { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.05) rotate(0deg); } }
        @keyframes wobble-fast { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-fly-across { animation: fly-across linear infinite; }
        .animate-flutter { animation: flutter 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-heartbeat { animation: heartbeat 0.8s ease-in-out infinite; }
        .animate-wobble-fast { animation: wobble-fast 0.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default TimeVisualizer;