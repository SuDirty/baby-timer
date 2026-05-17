import { animalAssets } from '../assets/visualAssets';

const SPRITES = [
  ['cat', animalAssets.cat, 'animate-float-slow', { top: '10%', left: '10%', animationDelay: '0s' }],
  ['dog', animalAssets.dog, 'animate-float-medium', { top: '20%', right: '15%', animationDelay: '1s' }],
  ['bird', animalAssets.bird, 'animate-fly-across', { top: '5%', left: '-5%', animationDuration: '15s' }],
  ['butterfly', animalAssets.butterfly, 'animate-flutter', { bottom: '25%', left: '20%', animationDelay: '0.5s' }],
  ['turtle', animalAssets.turtle, 'animate-float-slow', { bottom: '10%', right: '10%', animationDelay: '2s' }],
  ['unicorn', animalAssets.unicorn, 'animate-pulse-slow', { top: '50%', left: '5%', animationDelay: '1.5s' }],
  ['elephant', animalAssets.elephant, 'animate-bounce-slow', { bottom: '5%', left: '50%', animationDelay: '3s' }],
  ['giraffe', animalAssets.giraffe, 'animate-float-medium', { top: '15%', left: '60%', animationDelay: '2.5s' }],
];

const BackgroundSprites = ({ isIdleMode }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ${isIdleMode ? 'opacity-20' : 'opacity-100'}`} aria-hidden="true">
    {SPRITES.map(([id, src, animationClass, style]) => (
      <div key={id} className={`pointer-events-none absolute select-none opacity-25 ${animationClass}`} style={style}>
        <img className="h-14 w-14 object-contain drop-shadow-sm sm:h-16 sm:w-16" src={src} alt="" draggable="false" />
      </div>
    ))}
  </div>
);

export default BackgroundSprites;
