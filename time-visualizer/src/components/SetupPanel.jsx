import { Check } from 'lucide-react';
import { MAX_MINUTES, MIN_MINUTES, clampMinutes } from '../constants';

const SetupPanel = ({ setupMinutes, setSetupMinutes, onStart }) => {
  const adjustMinutes = (delta) => {
    setSetupMinutes((minutes) => clampMinutes(minutes + delta));
  };

  return (
    <div className="w-full rounded-xl border-4 border-yellow-100 bg-white p-5 shadow-xl sm:p-6">
      <label className="mb-4 block text-center text-lg font-bold text-slate-600" htmlFor="setup-minutes">
        設定時間 (分鐘)
      </label>
      <div className="mb-6 flex items-center justify-center gap-2 sm:gap-4">
        <button type="button" onClick={() => adjustMinutes(-5)} className="h-12 w-12 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200" aria-label="減少 5 分鐘">-5</button>
        <button type="button" onClick={() => adjustMinutes(-1)} className="h-10 w-10 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200" aria-label="減少 1 分鐘">-1</button>
        <input
          id="setup-minutes"
          type="number"
          inputMode="numeric"
          min={MIN_MINUTES}
          max={MAX_MINUTES}
          value={setupMinutes}
          onChange={(event) => setSetupMinutes(clampMinutes(event.target.value))}
          className="w-24 bg-transparent text-center text-4xl font-bold text-slate-700 outline-none"
          aria-label="倒數分鐘"
        />
        <button type="button" onClick={() => adjustMinutes(1)} className="h-10 w-10 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200" aria-label="增加 1 分鐘">+1</button>
        <button type="button" onClick={() => adjustMinutes(5)} className="h-12 w-12 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200" aria-label="增加 5 分鐘">+5</button>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-yellow-400 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-yellow-500 active:scale-95"
      >
        <Check size={28} />
        開始倒數
      </button>
    </div>
  );
};

export default SetupPanel;
