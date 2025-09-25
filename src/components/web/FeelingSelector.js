import React from 'react';
import { Sparkles, Send, RefreshCw, Loader2 } from 'lucide-react';

const FeelingSelector = ({
  predefinedFeelings,
  selectedFeelings,
  customFeeling,
  setCustomFeeling,
  isGenerating,
  onToggleFeeling,
  onGenerate,
  onReset,
  maxFeelings = 3,
  customFeelingMaxLength = 50
}) => {
  return (
    <section className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6" />
        今宵の感想をお選びください（最大{maxFeelings}つ）
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {predefinedFeelings.map(feeling => (
          <button
            key={feeling}
            onClick={() => onToggleFeeling(feeling)}
            className={`px-4 py-3 rounded-lg transition-all transform hover:scale-105 ${
              selectedFeelings.includes(feeling)
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {feeling}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          または、あなたの想いを自由にお書きください
        </label>
        <input
          type="text"
          value={customFeeling}
          onChange={(e) => setCustomFeeling(e.target.value)}
          placeholder="例：月の光に包まれて..."
          className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          maxLength={customFeelingMaxLength}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating || (selectedFeelings.length === 0 && !customFeeling.trim())}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              月歌を紡いでいます...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              月のかぐや姫へ送る
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          リセット
        </button>
      </div>
    </section>
  );
};

export default FeelingSelector;