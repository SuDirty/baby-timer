const SPRITES = [
  ['🐱', 'animate-float-slow', { top: '10%', left: '10%', animationDelay: '0s' }],
  ['🐶', 'animate-float-medium', { top: '20%', right: '15%', animationDelay: '1s' }],
  ['🐦', 'animate-fly-across', { top: '5%', left: '-5%', animationDuration: '15s' }],
  ['🦋', 'animate-flutter', { bottom: '25%', left: '20%', animationDelay: '0.5s' }],
  ['🐢', 'animate-float-slow', { bottom: '10%', right: '10%', animationDelay: '2s' }],
  ['🦄', 'animate-pulse-slow', { top: '50%', left: '5%', animationDelay: '1.5s' }],
  ['🐘', 'animate-bounce-slow', { bottom: '5%', left: '50%', animationDelay: '3s' }],
  ['🦒', 'animate-float-medium', { top: '15%', left: '60%', animationDelay: '2.5s' }],
];

const BackgroundSprites = ({ isIdleMode }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ${isIdleMode ? 'opacity-20' : 'opacity-100'}`} aria-hidden="true">
    {SPRITES.map(([emoji, animationClass, style]) => (
      <div key={`${emoji}-${style.top ?? style.bottom}-${style.left ?? style.right}`} className={`pointer-events-none absolute select-none text-4xl opacity-30 ${animationClass}`} style={style}>
        {emoji}
      </div>
    ))}
  </div>
);

export default BackgroundSprites;
