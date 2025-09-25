import React from 'react';
import { Database } from 'lucide-react';

const TsukiutaHistory = ({ recentTsukiutas, showHistory, setShowHistory, isSupabaseConfigured }) => {
  if (!isSupabaseConfigured) return null;

  return (
    <section className="bg-white/5 backdrop-blur-md rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Database className="w-6 h-6" />
          今宵の月歌たち（データベース）
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-purple-300 hover:text-purple-200"
        >
          {showHistory ? '隠す' : `表示 (${recentTsukiutas.length}件)`}
        </button>
      </div>

      {showHistory && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentTsukiutas.map((tsukiuta) => (
            <div
              key={tsukiuta.id}
              className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all"
            >
              <div className="font-serif text-lg mb-2">
                {tsukiuta.tsukiuta}
              </div>
              <div className="text-xs text-purple-300 space-y-1">
                <p>感想: {tsukiuta.impression}</p>
                <p>音数: {tsukiuta.syllables_line1}-{tsukiuta.syllables_line2}-{tsukiuta.syllables_line3}</p>
                <p>作成: {new Date(tsukiuta.created_at).toLocaleString('ja-JP')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TsukiutaHistory;