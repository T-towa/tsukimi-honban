import React from 'react';

const PointsCard = ({ points, isLoading, deviceId }) => {
  // ポイントに応じた装飾レベルの説明
  const getDecorationLevel = (points) => {
    if (points === 0) return { level: 0, description: "ポイントがありません。体験コンテンツでポイントを集めましょう！" };
    if (points === 1) return { level: 1, description: "シンプルな月の装飾" };
    if (points === 2) return { level: 2, description: "月と星の装飾" };
    if (points === 3) return { level: 3, description: "月・星・光の装飾" };
    if (points === 4) return { level: 4, description: "華やかな月夜の装飾" };
    if (points === 5) return { level: 5, description: "最高級の幻想的な装飾" };
    return { level: 0, description: "" };
  };

  const decoration = getDecorationLevel(points);

  // ポイント数に応じたグラデーション
  const getGradient = (points) => {
    if (points === 0) return "from-gray-600 to-gray-700";
    if (points === 1) return "from-blue-400 to-blue-500";
    if (points === 2) return "from-purple-400 to-purple-500";
    if (points === 3) return "from-pink-400 to-purple-500";
    if (points === 4) return "from-yellow-300 to-pink-400";
    if (points === 5) return "from-yellow-200 via-pink-300 to-purple-400";
    return "from-gray-600 to-gray-700";
  };

  // ポイント数に応じた星の表示
  const renderStars = (points) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-2xl ${i < points ? 'opacity-100' : 'opacity-20'}`}>
        ⭐
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border-2 border-yellow-400/50">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2 text-yellow-300">デバイスIDが見つかりません</h3>
        <p className="text-white/70 text-sm">
          NFCタグをスキャンしてアクセスしてください
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${getGradient(points)} rounded-2xl p-8 max-w-md mx-auto shadow-2xl transform transition-all hover:scale-105`}>
      {/* ポイント表示 */}
      <div className="text-center mb-6">
        <div className="text-7xl font-bold text-white mb-2">
          {points}
        </div>
        <div className="text-white/90 text-lg font-semibold">
          月歌ポイント
        </div>
      </div>

      {/* 星評価 */}
      <div className="flex justify-center gap-1 mb-6">
        {renderStars(points)}
      </div>

      {/* 装飾レベル説明 */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="text-white/90 text-sm font-semibold mb-2">
          プロジェクションマッピング装飾
        </div>
        <div className="text-white text-base">
          {decoration.description}
        </div>
      </div>

      {/* ポイント使用説明 */}
      <div className="bg-white/10 rounded-xl p-4">
        <div className="text-white/80 text-sm">
          {points === 0 ? (
            <>
              <span className="text-red-300 font-semibold">⚠️ ポイントが0の場合、月歌を送ることができません。</span>
              <br />
              体験コンテンツでポイントを集めてください。
            </>
          ) : (
            <>
              ポイントに応じて、プロジェクションマッピングの装飾が豪華になります。
              <br />
              <span className="text-yellow-200 font-semibold">月歌を送信するとポイントは全て使用されます。</span>
            </>
          )}
        </div>
      </div>

      {/* デバイスID表示（デバッグ用・小さく） */}
      <div className="mt-4 text-center text-white/40 text-xs">
        Device ID: {deviceId}
      </div>
    </div>
  );
};

export default PointsCard;
