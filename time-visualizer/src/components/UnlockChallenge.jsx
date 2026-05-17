import { Delete, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const UnlockChallenge = ({
  challenge,
  inputAnswer,
  onBackspace,
  onClose,
  onNumberInput,
  onSubmit,
  shouldShake,
}) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (!shouldShake) return undefined;

    setIsShaking(true);
    const timeout = window.setTimeout(() => setIsShaking(false), 300);
    return () => window.clearTimeout(timeout);
  }, [shouldShake]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="unlock-title">
      <div className={`w-full max-w-[320px] rounded-xl border-4 border-slate-200 bg-white p-5 shadow-2xl ${isShaking ? 'animate-shake' : ''}`}>
        <div className="mb-2 flex items-center justify-between">
          <h3 id="unlock-title" className="text-lg font-bold text-slate-700">家長解鎖</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="關閉解鎖視窗">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-100 p-4">
          <span className="text-xl font-bold text-slate-500">{challenge.q}</span>
          <span className="min-w-[60px] border-b-2 border-blue-200 text-right text-2xl font-bold tracking-wider text-blue-600">
            {inputAnswer || '?'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} type="button" onClick={() => onNumberInput(num.toString())} className="rounded-lg border-2 border-slate-100 bg-white py-3 text-xl font-bold text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 active:scale-95">
              {num}
            </button>
          ))}
          <button type="button" onClick={onBackspace} className="flex items-center justify-center rounded-lg border-2 border-slate-100 bg-slate-50 py-3 text-slate-400 transition-all hover:bg-slate-200 active:scale-95" aria-label="刪除一位數字">
            <Delete size={20} />
          </button>
          <button type="button" onClick={() => onNumberInput('0')} className="rounded-lg border-2 border-slate-100 bg-white py-3 text-xl font-bold text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 active:scale-95">
            0
          </button>
          <button type="button" onClick={onSubmit} className="rounded-lg bg-blue-500 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-600 active:scale-95">
            OK
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-slate-300">請計算答案以解鎖</p>
      </div>
    </div>
  );
};

export default UnlockChallenge;
