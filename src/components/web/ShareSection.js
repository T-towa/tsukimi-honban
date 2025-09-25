import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const ShareSection = ({ tsukiuta }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `私の月歌：${tsukiuta.tsukiuta}\n\n金澤月見光路で月歌を作ってみませんか？`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('コピーに失敗しました:', error);
    }
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(lineUrl, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '月歌 -つきうた-',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('共有に失敗しました:', error);
      }
    }
  };

  return (
    <section className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
        <span>📤</span>
        あなたの月歌をシェアしよう
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* ネイティブ共有（モバイル） */}
        {navigator.share && (
          <button
            onClick={shareNative}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <span>📱</span>
            シェア
          </button>
        )}

        {/* コピー */}
        <button
          onClick={copyToClipboard}
          className={`${
            copied
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
          } px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105`}
        >
          <span>{copied ? '✅' : '📋'}</span>
          {copied ? 'コピー完了！' : 'コピー'}
        </button>

        {/* Twitter */}
        <button
          onClick={shareOnTwitter}
          className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          <span>🐦</span>
          Twitter
        </button>

        {/* LINE */}
        <button
          onClick={shareOnLine}
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          <span>💚</span>
          LINE
        </button>
      </div>

      {/* QRコード */}
      <div className="text-center">
        <button
          onClick={() => setShowQR(!showQR)}
          className="text-purple-300 hover:text-purple-200 text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <span>📱</span>
          {showQR ? 'QRコードを隠す' : 'QRコードを表示'}
        </button>

        {showQR && (
          <div className="mt-4 p-4 bg-white rounded-lg inline-block">
            <QRCode
              value={shareUrl}
              size={120}
              level="M"
              includeMargin={true}
            />
            <p className="text-xs text-gray-600 mt-2">QRコードでアクセス</p>
          </div>
        )}
      </div>

      {/* イベント案内 */}
      <div className="mt-6 text-center text-sm text-purple-200 bg-white/10 rounded-lg p-3">
        <p className="mb-1">🎪 <strong>金澤月見光路</strong> で月歌体験中</p>
        <p>友達にもシェアして、みんなで月歌を楽しもう！</p>
      </div>
    </section>
  );
};

export default ShareSection;