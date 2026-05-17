import {
  BASE_RADIUS,
  HOUR_COLORS,
  OUTER_STROKE_WIDTH,
  RING_GAP,
  SECOND_RING_RADIUS,
  SECOND_RING_STROKE_WIDTH,
  SVG_CENTER,
} from '../constants';

const getPiePath = (cx, cy, radius, startAngle, endAngle) => {
  const start = (startAngle - 90) * (Math.PI / 180);
  const end = (endAngle - 90) * (Math.PI / 180);
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const getEffectiveSeconds = (timeLeft) => {
  if (timeLeft <= 0) return 0;
  const secondsValue = timeLeft % 60;
  return secondsValue === 0 ? 60 : secondsValue;
};

const ClockFace = ({ now, formatClockTime }) => {
  const secondsProgress = now.getSeconds() / 60;
  const secondsCircumference = 2 * Math.PI * BASE_RADIUS;
  const secondsDashOffset = secondsCircumference * (1 - secondsProgress);

  return (
    <>
      <circle cx={SVG_CENTER.x} cy={SVG_CENTER.y} r={BASE_RADIUS} fill="#1e293b" stroke="#334155" strokeWidth="4" />
      <circle
        cx={SVG_CENTER.x}
        cy={SVG_CENTER.y}
        r={BASE_RADIUS}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="6"
        strokeDasharray={secondsCircumference}
        strokeDashoffset={secondsDashOffset}
        strokeLinecap="round"
        className="origin-center -rotate-90"
        style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 4px #38bdf8)' }}
      />
      <foreignObject x="0" y="0" width="320" height="320">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center font-mono font-bold">
            <span className="text-6xl font-bold leading-tight tracking-normal text-slate-100 drop-shadow-lg sm:text-7xl">
              {formatClockTime(now)}
            </span>
            <span className="mt-2 font-sans text-lg tracking-wide text-slate-400">
              {now.toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
          </div>
        </div>
      </foreignObject>
    </>
  );
};

const TimerRings = ({ totalTime, timeLeft, isUrgent }) => {
  const rings = [];
  let secondsRing = null;

  if (timeLeft > 0) {
    const secondsProgress = getEffectiveSeconds(timeLeft) / 60;
    const secondsCircumference = 2 * Math.PI * SECOND_RING_RADIUS;
    const secondsDashOffset = secondsCircumference * (1 - secondsProgress);
    const secondsColor = isUrgent ? '#EF4444' : '#64748B';

    secondsRing = (
      <g key="seconds-ring">
        <circle cx={SVG_CENTER.x} cy={SVG_CENTER.y} r={SECOND_RING_RADIUS} fill="none" stroke={secondsColor} strokeWidth={SECOND_RING_STROKE_WIDTH} strokeOpacity="0.1" />
        <circle
          cx={SVG_CENTER.x}
          cy={SVG_CENTER.y}
          r={SECOND_RING_RADIUS}
          fill="none"
          stroke={secondsColor}
          strokeWidth={SECOND_RING_STROKE_WIDTH}
          strokeDasharray={secondsCircumference}
          strokeDashoffset={secondsDashOffset}
          strokeLinecap="round"
          className={`origin-center -rotate-90 ${isUrgent ? 'animate-heartbeat' : ''}`}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </g>
    );
  }

  const totalHoursNeeded = Math.ceil(totalTime / 3600);

  for (let i = totalHoursNeeded - 1; i >= 0; i -= 1) {
    const ringStartSeconds = i * 3600;
    const ringEndSeconds = (i + 1) * 3600;
    const isActiveLayer = timeLeft > ringStartSeconds && timeLeft <= ringEndSeconds;
    const color = isUrgent && isActiveLayer ? '#EF4444' : HOUR_COLORS[i % HOUR_COLORS.length];

    if (i === 0) {
      const angle = timeLeft >= 3600 ? 360 : Math.max(0, (timeLeft / 3600) * 360);

      if (angle > 0) {
        rings.push(<circle key="pie-bg" cx={SVG_CENTER.x} cy={SVG_CENTER.y} r={BASE_RADIUS} fill={color} fillOpacity="0.1" />);
        rings.push(
          angle > 359.9
            ? <circle key="pie-full" cx={SVG_CENTER.x} cy={SVG_CENTER.y} r={BASE_RADIUS} fill={color} className={`transition-all duration-500 ease-in-out ${isUrgent ? 'animate-heartbeat' : ''}`} />
            : <path key="pie-slice" d={getPiePath(SVG_CENTER.x, SVG_CENTER.y, BASE_RADIUS, 0, angle)} fill={color} className={`transition-all duration-500 ease-in-out ${isUrgent ? 'animate-heartbeat' : ''}`} />
        );
      }
    } else {
      const radius = BASE_RADIUS + i * RING_GAP;
      const circumference = 2 * Math.PI * radius;
      let progress = 0;

      if (timeLeft >= ringEndSeconds) progress = 1;
      else if (timeLeft > ringStartSeconds) progress = (timeLeft - ringStartSeconds) / 3600;

      rings.push(
        <g key={`ring-${i}`}>
          <circle cx={SVG_CENTER.x} cy={SVG_CENTER.y} r={radius} fill="none" stroke={color} strokeWidth={OUTER_STROKE_WIDTH} strokeOpacity="0.2" strokeLinecap="round" />
          <circle
            cx={SVG_CENTER.x}
            cy={SVG_CENTER.y}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={OUTER_STROKE_WIDTH}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="origin-center -rotate-90"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </g>
      );
    }
  }

  if (secondsRing) rings.push(secondsRing);
  return rings;
};

const TimerCharacter = ({ isFinished, isRunning, isUrgent, showSetup, timeLeft }) => {
  const emojiSize = 200;
  let emojiX = 60;
  let emojiY = 60;

  if (!showSetup && timeLeft > 0) {
    const angleDegrees = (getEffectiveSeconds(timeLeft) / 60) * 360;
    const angleRadians = (angleDegrees - 90) * (Math.PI / 180);
    const emojiCenterX = SVG_CENTER.x + SECOND_RING_RADIUS * Math.cos(angleRadians);
    const emojiCenterY = SVG_CENTER.y + SECOND_RING_RADIUS * Math.sin(angleRadians);

    emojiX = emojiCenterX - emojiSize / 2;
    emojiY = emojiCenterY - emojiSize / 2;
  }

  return (
    <foreignObject x={emojiX} y={emojiY} width={emojiSize} height={emojiSize}>
      <div className="flex h-full w-full flex-col items-center justify-center">
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
        )}
      </div>
    </foreignObject>
  );
};

const TimerVisual = ({
  formatClockTime,
  isFinished,
  isIdleMode,
  isRunning,
  isUrgent,
  now,
  showSetup,
  timeLeft,
  totalTime,
}) => (
  <div className="relative mb-8 flex aspect-square max-w-full items-center justify-center" style={{ width: 'min(80vw, 20rem)' }}>
    {isFinished && !isIdleMode && (
      <div className="absolute inset-0 z-20 flex animate-bounce flex-col items-center justify-center">
        <span className="text-6xl">🎉</span>
        <span className="mt-2 rounded-full bg-white/80 px-4 py-1 text-2xl font-bold text-slate-700 shadow-sm">
          時間到囉！
        </span>
      </div>
    )}

    <svg className="h-full w-full drop-shadow-xl" viewBox="0 0 320 320" aria-hidden="true">
      {isIdleMode ? (
        <ClockFace now={now} formatClockTime={formatClockTime} />
      ) : (
        <>
          <TimerRings totalTime={totalTime} timeLeft={timeLeft} isUrgent={isUrgent} />
          <TimerCharacter isFinished={isFinished} isRunning={isRunning} isUrgent={isUrgent} showSetup={showSetup} timeLeft={timeLeft} />
        </>
      )}
    </svg>
  </div>
);

export default TimerVisual;
