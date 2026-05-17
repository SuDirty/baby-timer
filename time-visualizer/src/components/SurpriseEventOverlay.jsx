import { animalAssets, decorAssets } from '../assets/visualAssets';

const CAT_RAIN = [
  ['catFull', 4, '8%', '0s'],
  ['catFull', 5, '22%', '0.2s'],
  ['catFull', 4.5, '36%', '0.45s'],
  ['catFull', 5.5, '51%', '0.1s'],
  ['catFull', 4.75, '66%', '0.35s'],
  ['catFull', 4.25, '80%', '0.6s'],
  ['catFull', 5.25, '92%', '0.25s'],
];

const ELEPHANT_MIGRATION = [
  ['elephant', 7.5, '-10%', '0s'],
  ['elephant', 6.5, '-24%', '0.28s'],
  ['elephant', 8.25, '-38%', '0.52s'],
  ['elephant', 6.75, '-52%', '0.8s'],
];

const STAR_BURST = [
  ['18%', '24%', '0s'],
  ['32%', '16%', '0.12s'],
  ['48%', '22%', '0.24s'],
  ['62%', '15%', '0.08s'],
  ['78%', '28%', '0.18s'],
  ['24%', '72%', '0.28s'],
  ['50%', '78%', '0.16s'],
  ['72%', '68%', '0.34s'],
];

const FloatingAsset = ({ className = '', src, style }) => (
  <img className={`pointer-events-none select-none object-contain drop-shadow-md ${className}`} src={src} alt="" draggable="false" style={style} />
);

const CatRain = () => (
  <>
    {CAT_RAIN.map(([assetId, size, left, delay], index) => (
      <FloatingAsset
        key={`${assetId}-${left}-${delay}`}
        className="animate-cat-rain"
        src={animalAssets[assetId]}
        style={{
          animationDelay: delay,
          height: `${size}rem`,
          left,
          top: '-7rem',
          width: `${size}rem`,
          '--fall-rotate': `${index % 2 === 0 ? 18 : -16}deg`,
        }}
      />
    ))}
  </>
);

const ElephantMigration = () => (
  <>
    <div className="absolute inset-x-0 bottom-[15%] h-14 bg-emerald-200/30 blur-xl" />
    {ELEPHANT_MIGRATION.map(([assetId, size, left, delay], index) => (
      <FloatingAsset
        key={`${assetId}-${left}-${delay}`}
        className="animate-elephant-migration"
        src={animalAssets[assetId]}
        style={{
          animationDelay: delay,
          bottom: `${12 + index * 3}%`,
          height: `${size}rem`,
          left,
          width: `${size}rem`,
        }}
      />
    ))}
  </>
);

const StarBurst = () => (
  <>
    {STAR_BURST.map(([left, top, delay], index) => (
      <FloatingAsset
        key={`${left}-${top}-${delay}`}
        className="animate-star-burst"
        src={index % 3 === 0 ? decorAssets.partyPopper : decorAssets.star}
        style={{
          animationDelay: delay,
          height: index % 3 === 0 ? '3.25rem' : '2.5rem',
          left,
          top,
          width: index % 3 === 0 ? '3.25rem' : '2.5rem',
          '--burst-x': `${(index % 4 - 1.5) * 34}px`,
          '--burst-y': `${index < 4 ? -42 : 36}px`,
        }}
      />
    ))}
  </>
);

const SurpriseEventOverlay = ({ event }) => {
  if (!event) return null;

  return (
    <div key={event.id} className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {event.type === 'cat-rain' && <CatRain />}
      {event.type === 'elephant-migration' && <ElephantMigration />}
      {event.type === 'star-burst' && <StarBurst />}
    </div>
  );
};

export default SurpriseEventOverlay;
