import React from 'react';

const Survey = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
      {/* ヘッダー */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white text-center">
            🌙 月歌アンケート
          </h1>
          <p className="text-white/70 text-center mt-2">
            体験についてのご感想をお聞かせください
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Google Form埋め込み */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="w-full overflow-hidden rounded-lg">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScE-bM17iPQBQS8IhywEtF_P-gIQ0WLM0NOgDabikpXhluszw/viewform?embedded=true"
                width="100%"
                height="1520"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                title="月歌アンケート"
                className="w-full"
              >
                読み込んでいます…
              </iframe>
            </div>
          </div>

          {/* 戻るボタン */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              ← 月歌生成に戻る
            </a>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-16 py-8 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            ご協力ありがとうございます
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Survey;
