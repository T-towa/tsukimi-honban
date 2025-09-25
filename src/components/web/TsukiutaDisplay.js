import React from 'react';

const TsukiutaDisplay = ({ tsukiuta, showAnimation, isSaving, isSupabaseConfigured }) => {
  if (!tsukiuta) return null;

  return (
    <section className={`bg-gradient-to-r from-yellow-400/20 to-purple-400/20 backdrop-blur-md rounded-2xl p-8 mb-8 text-center ${
      showAnimation ? 'animate-fade-in' : ''
    }`}>
      <h3 className="text-2xl font-semibold mb-6">あなたの月歌</h3>
      <div className="text-3xl font-serif mb-4 leading-relaxed">
        <p>{tsukiuta.line1}</p>
        <p>{tsukiuta.line2}</p>
        <p>{tsukiuta.line3}</p>
      </div>
      {tsukiuta.reading && (
        <p className="text-sm text-purple-200 mb-2">{tsukiuta.reading}</p>
      )}
      {tsukiuta.explanation && (
        <p className="text-sm text-purple-300 mb-4">{tsukiuta.explanation}</p>
      )}
      <div className="text-xs text-purple-200 bg-white/10 rounded-lg p-3 inline-block">
        <p>音数: {tsukiuta.syllables_line1}-{tsukiuta.syllables_line2}-{tsukiuta.syllables_line3}</p>
        {isSaving && <p className="mt-2">データベースに保存中...</p>}
        {!isSaving && isSupabaseConfigured && <p className="mt-2">✓ データベースに保存済み</p>}
      </div>
    </section>
  );
};

export default TsukiutaDisplay;