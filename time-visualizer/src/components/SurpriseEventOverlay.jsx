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

const DOG_PARADE = [
  ['dogFull', 5.5, '-16%', '0s', '20%'],
  ['dogFull', 4.75, '-32%', '0.25s', '30%'],
  ['dogFull', 5.25, '-48%', '0.5s', '40%'],
  ['dogFull', 4.5, '-64%', '0.75s', '50%'],
];

const RABBIT_HOP = [
  ['rabbitFull', '12%', '70%', '0s'],
  ['rabbitFull', '30%', '62%', '0.18s'],
  ['rabbitFull', '50%', '68%', '0.36s'],
  ['rabbitFull', '70%', '58%', '0.54s'],
  ['rabbitFull', '86%', '66%', '0.72s'],
];

const BUTTERFLY_FLUTTER = [
  ['butterfly', '10%', '24%', '0s'],
  ['butterfly', '24%', '38%', '0.25s'],
  ['butterfly', '42%', '18%', '0.1s'],
  ['butterfly', '60%', '36%', '0.4s'],
  ['butterfly', '78%', '22%', '0.2s'],
];

const PENGUIN_SLIDE = [
  ['penguin', 4.5, '-12%', '0s', '72%'],
  ['penguin', 4, '-26%', '0.22s', '78%'],
  ['penguin', 4.75, '-40%', '0.44s', '68%'],
];

const TURTLE_MARCH = [
  ['turtle', 4.5, '-12%', '0s', '76%'],
  ['turtle', 4.25, '-28%', '0.45s', '70%'],
  ['turtle', 4.75, '-44%', '0.9s', '80%'],
];

const UNICORN_SPARKLE = [
  ['unicorn', '18%', '58%', '0s'],
  ['star', '30%', '44%', '0.12s'],
  ['star', '46%', '52%', '0.24s'],
  ['unicorn', '62%', '40%', '0.36s'],
  ['star', '76%', '54%', '0.48s'],
];

const CLOUD_SUN = [
  ['cloud', '6%', '24%', '0s'],
  ['sun', '42%', '14%', '0.15s'],
  ['cloud', '72%', '28%', '0.3s'],
];

const SLOTH_FLOAT = [
  ['sloth', '14%', '72%', '0s'],
  ['sloth', '42%', '76%', '0.3s'],
  ['sloth', '70%', '68%', '0.6s'],
];

const SAFARI_STAMPEDE = [
  ['giraffe', 6.5, '-14%', '0s', '18%'],
  ['leopard', 5, '-30%', '0.16s', '52%'],
  ['deer', 5.75, '-46%', '0.32s', '40%'],
  ['goat', 4.75, '-62%', '0.48s', '66%'],
  ['horse', 5.5, '-78%', '0.64s', '74%'],
];

const OWL_NIGHT = [
  ['owl', '12%', '20%', '0s'],
  ['crescentMoon', '58%', '14%', '0.1s'],
  ['star', '32%', '34%', '0.22s'],
  ['owl', '74%', '28%', '0.34s'],
  ['star', '86%', '48%', '0.46s'],
];

const FloatingAsset = ({ className = '', src, style }) => (
  <img className={`pointer-events-none select-none object-contain drop-shadow-md ${className}`} src={src} alt="" draggable="false" style={style} />
);

const getAsset = (assetId) => animalAssets[assetId] ?? decorAssets[assetId];

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

const Parade = ({ items, className }) => items.map(([assetId, size, left, delay, top], index) => (
  <FloatingAsset
    key={`${assetId}-${left}-${delay}`}
    className={className}
    src={getAsset(assetId)}
    style={{
      animationDelay: delay,
      height: `${size}rem`,
      left,
      top,
      width: `${size}rem`,
      '--surprise-direction': index % 2 === 0 ? 1 : -1,
    }}
  />
));

const Scatter = ({ items, className, size = '4rem' }) => items.map(([assetId, left, top, delay], index) => (
  <FloatingAsset
    key={`${assetId}-${left}-${top}-${delay}`}
    className={className}
    src={getAsset(assetId)}
    style={{
      animationDelay: delay,
      height: size,
      left,
      top,
      width: size,
      '--burst-x': `${(index % 3 - 1) * 42}px`,
      '--burst-y': `${index % 2 === 0 ? -46 : 34}px`,
    }}
  />
));

const SurpriseEventOverlay = ({ event }) => {
  if (!event) return null;

  return (
    <div key={event.id} className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {event.type === 'cat-rain' && <CatRain />}
      {event.type === 'elephant-migration' && <ElephantMigration />}
      {event.type === 'star-burst' && <StarBurst />}
      {event.type === 'dog-parade' && <Parade items={DOG_PARADE} className="animate-animal-parade" />}
      {event.type === 'rabbit-hop' && <Scatter items={RABBIT_HOP} className="animate-rabbit-hop" />}
      {event.type === 'butterfly-flutter' && <Scatter items={BUTTERFLY_FLUTTER} className="animate-butterfly-surprise" size="3.5rem" />}
      {event.type === 'penguin-slide' && <Parade items={PENGUIN_SLIDE} className="animate-penguin-slide" />}
      {event.type === 'turtle-march' && <Parade items={TURTLE_MARCH} className="animate-turtle-march" />}
      {event.type === 'unicorn-sparkle' && <Scatter items={UNICORN_SPARKLE} className="animate-unicorn-sparkle" size="4.25rem" />}
      {event.type === 'cloud-sun' && <Scatter items={CLOUD_SUN} className="animate-cloud-sun" size="5rem" />}
      {event.type === 'sloth-float' && <Scatter items={SLOTH_FLOAT} className="animate-sloth-float" />}
      {event.type === 'safari-stampede' && <Parade items={SAFARI_STAMPEDE} className="animate-safari-stampede" />}
      {event.type === 'owl-night' && <Scatter items={OWL_NIGHT} className="animate-owl-night" size="4rem" />}
    </div>
  );
};

export default SurpriseEventOverlay;
