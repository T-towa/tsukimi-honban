import React from 'react';
import { Send, Sparkles, Moon, Heart } from 'lucide-react';

const TsukiutaIntro = ({ onStartGeneration }) => {
  return (
    <div className="text-center py-12">
      {/* メインタイトル */}
      <div className="mb-8">
        <div className="text-6xl mb-4 animate-pulse">🌕</div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-white">
          あなたの感想を
        </h2>
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-white">
          月に届けませんか？
        </h2>
      </div>

      {/* 月歌について */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 max-w-lg mx-auto">
        <h3 className="text-xl font-semibold mb-3 text-yellow-300">月歌とは？</h3>
        <p className="text-white/80 text-sm leading-relaxed">
          あなたの体験と感想から生まれる不思議な歌<br></br>
          月の世界に住むかぐや姫へのメッセージとして、<br></br>
          特別な一首をお作りします。
        </p>
      </div>

      {/* 生成開始ボタン */}
      <button
        onClick={onStartGeneration}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all transform hover:scale-105 shadow-lg"
        style={{
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
        }}
      >
        <Send className="w-6 h-6" />
        月歌を作り始める
      </button>

      {/* フッターメッセージ */}
      <div className="mt-8">
        <p className="text-white/50 text-sm">
          あなたの心に残った瞬間を、美しい月歌に変えてみませんか
        </p>
      </div>
    </div>
  );
};

export default TsukiutaIntro;