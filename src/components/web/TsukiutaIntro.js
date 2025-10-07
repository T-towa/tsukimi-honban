import React from 'react';
import { Send, Sparkles, Moon, Heart, Lock } from 'lucide-react';

const TsukiutaIntro = ({ onStartGeneration, userPoints = 0, isDisabled = false }) => {
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
        onClick={isDisabled ? null : onStartGeneration}
        disabled={isDisabled}
        className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all shadow-lg ${
          isDisabled
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
        }`}
        style={
          isDisabled
            ? {}
            : {
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
              }
        }
      >
        {isDisabled ? (
          <>
            <Lock className="w-6 h-6" />
            ポイントが必要です
          </>
        ) : (
          <>
            <Send className="w-6 h-6" />
            月歌を作り始める
          </>
        )}
      </button>

      {/* フッターメッセージ */}
      <div className="mt-8">
        {isDisabled ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-red-300 text-sm font-semibold mb-2">
              ⚠️ ポイントが0のため月歌を作成できません
            </p>
            <p className="text-white/70 text-xs">
              体験コンテンツでポイントを集めてください
            </p>
          </div>
        ) : (
          <p className="text-white/50 text-sm">
            あなたの心に残った瞬間を、美しい月歌に変えてみませんか
          </p>
        )}
      </div>
    </div>
  );
};

export default TsukiutaIntro;