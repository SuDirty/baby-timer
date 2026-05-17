import {
  BASE_RADIUS,
  HOUR_COLORS,
  OUTER_STROKE_WIDTH,
  RING_GAP,
  SECOND_RING_RADIUS,
  SECOND_RING_STROKE_WIDTH,
  SVG_CENTER,
} from '../constants';
import { animalAssets, decorAssets } from '../assets/visualAssets';

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

const getOrbitPosition = (seconds, radius, offsetDegrees = 0) => {
  const angleDegrees = (getEffectiveSeconds(seconds) / 60) * 360 + offsetDegrees;
  const angleRadians = (angleDegrees - 90) * (Math.PI / 180);

  return {
    angleDegrees,
    x: SVG_CENTER.x + radius * Math.cos(angleRadians),
    y: SVG_CENTER.y + radius * Math.sin(angleRadians),
  };
};

const getDirectionScale = (angleDegrees) => {
  const normalizedAngle = ((angleDegrees % 360) + 360) % 360;
  return normalizedAngle > 90 && normalizedAngle < 270 ? 1 : -1;
};

const AssetImage = ({ className = '', direction = 1, src, alt = '', style, ...props }) => (
  <img
    className={`select-none object-contain ${className}`}
    src={src}
    alt={alt}
    draggable="false"
    style={{ '--runner-direction': direction, ...style }}
    {...props}
  />
);

const getAnimalSrc = (animalId) => animalAssets[animalId] ?? animalAssets.turtle;

const ClockFace = ({ now, formatClockTime }) => {
  const secondsProgress = now.getSeconds() / 60;
  const secondsCircumference = 2 * Math.PI * BASE_RADIUS;
  const secondsDashOffset = secondsCircumference * (1 - secondsProgress);

  return (
    <>
      <g opacity="0.95">
        <image href={decorAssets.crescentMoon} x="46" y="34" width="44" height="44" className="animate-float-slow" />
        <image href={decorAssets.star} x="230" y="46" width="28" height="28" className="animate-twinkle" />
        <image href={decorAssets.star} x="82" y="238" width="20" height="20" className="animate-twinkle-delayed" />
        <image href={decorAssets.cloud} x="208" y="218" width="56" height="56" className="animate-float-medium" opacity="0.72" />
      </g>
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

const TimerCharacter = ({ isFinished, isRunning, isUrgent, runnerAnimal, showSetup, timeLeft }) => {
  const emojiSize = 200;
  let emojiX = 60;
  let emojiY = 60;

  if (!showSetup && timeLeft > 0) {
    const position = getOrbitPosition(timeLeft, SECOND_RING_RADIUS);

    emojiX = position.x - emojiSize / 2;
    emojiY = position.y - emojiSize / 2;
  }

  const animalSrc = getAnimalSrc(runnerAnimal);
  const direction = getDirectionScale(getOrbitPosition(timeLeft, SECOND_RING_RADIUS).angleDegrees);

  return (
    <foreignObject x={emojiX} y={emojiY} width={emojiSize} height={emojiSize}>
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        {isFinished ? (
          <AssetImage className="h-20 w-20 animate-celebrate-pop drop-shadow-md" src={decorAssets.partyPopper} />
        ) : isRunning ? (
          isUrgent ? (
            <>
              <span className="absolute left-11 top-[5.2rem] h-3 w-16 rounded-full bg-red-300/50 blur-sm" />
              <AssetImage className="h-24 w-24 animate-sprint drop-shadow-md" direction={direction} src={animalSrc} />
            </>
          ) : (
            <AssetImage className="h-20 w-20 animate-run-bob drop-shadow-md" direction={direction} src={animalSrc} />
          )
        ) : (
          <>
            <AssetImage className="h-20 w-20 opacity-75 drop-shadow-md saturate-[0.85]" src={animalSrc} />
            <AssetImage className="absolute right-12 top-10 h-8 w-8 animate-float-slow opacity-90" src={decorAssets.crescentMoon} />
            <span className="absolute right-10 top-6 font-mono text-lg font-bold text-slate-400">Z</span>
            <span className="absolute right-6 top-2 font-mono text-sm font-bold text-slate-300">Z</span>
          </>
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
  runnerAnimal,
}) => (
  <div className="relative mb-8 flex aspect-square max-w-full items-center justify-center" style={{ width: 'min(80vw, 20rem)' }}>
    {isFinished && !isIdleMode && (
      <div className="absolute inset-0 z-20 flex animate-bounce flex-col items-center justify-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <AssetImage className="absolute left-12 top-8 h-10 w-10 animate-confetti-fall" src={decorAssets.star} />
          <AssetImage className="absolute right-10 top-12 h-12 w-12 animate-confetti-fall-delayed" src={decorAssets.partyPopper} />
          <span className="absolute left-16 top-24 h-3 w-10 rotate-12 rounded-full bg-pink-400 animate-ribbon-sway" />
          <span className="absolute right-16 top-24 h-3 w-12 -rotate-12 rounded-full bg-sky-400 animate-ribbon-sway-delayed" />
          <span className="absolute left-24 bottom-20 h-3 w-10 -rotate-6 rounded-full bg-emerald-400 animate-ribbon-sway-delayed" />
        </div>
        <AssetImage className="h-16 w-16 animate-celebrate-pop drop-shadow-md" src={decorAssets.partyPopper} />
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
          <TimerCharacter isFinished={isFinished} isRunning={isRunning} isUrgent={isUrgent} runnerAnimal={runnerAnimal} showSetup={showSetup} timeLeft={timeLeft} />
        </>
      )}
    </svg>
  </div>
);

export default TimerVisual;
