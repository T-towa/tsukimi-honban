import React, { useState } from 'react';
import { useTsukiutaController } from './controllers/TsukiutaController';
import Header from './components/web/Header';
import WizardForm from './components/web/WizardForm';
import TsukiutaIntro from './components/web/TsukiutaIntro';
import BottomTabs from './components/web/BottomTabs';
import PointsCard from './components/web/PointsCard';
import DebugPanel from './components/web/DebugPanel';

const TsukiutaGenerator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showWizard, setShowWizard] = useState(false);

  const {
    // 状態
    selectedFeelings,
    customFeeling,
    generatedTsukiuta,
    isGenerating,
    recentTsukiutas,
    showAnimation,
    isSaving,
    showHistory,
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured,
    unityEndpoint,
    unityEnabled,

    // ポイント管理
    deviceId,
    userPoints,
    isLoadingPoints,
    deviceIdExistsInDB,

    // アクション
    setCustomFeeling,
    generateTsukiuta,
    sendTsukiutaToMoon,
    clearSelections,
    fetchUserPoints

  } = useTsukiutaController();

  // デバッグモード: デバイスID変更時にポイントを再取得
  const handleDebugDeviceIdChange = () => {
    fetchUserPoints();
  };

  // タブ変更時のハンドラー
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'tsukiuta') {
      setShowWizard(false); // 月歌生成タブ以外に移動したら導入画面に戻す
    }
  };

  // アンケートフォームのページ遷移検知
  React.useEffect(() => {
    if (activeTab === 'survey') {
      const surveyContainer = document.getElementById('survey-scroll-container');
      if (surveyContainer) {
        // iframe内のページ遷移を検知するため、定期的にスクロール位置をチェック
        let lastScrollCheck = Date.now();
        let isScrolling = false;

        const checkScroll = setInterval(() => {
          const now = Date.now();
          const currentScroll = surveyContainer.scrollTop;

          // ユーザーがスクロール中かどうかを判定
          if (Math.abs(currentScroll - (surveyContainer._lastScroll || 0)) > 5) {
            lastScrollCheck = now;
            isScrolling = true;
          } else if (now - lastScrollCheck > 500) {
            isScrolling = false;
          }

          surveyContainer._lastScroll = currentScroll;

          // スクロール位置が下にあり、2秒間スクロールしていない場合は上に戻す
          if (!isScrolling && currentScroll > 200 && now - lastScrollCheck > 2000) {
            surveyContainer.scrollTo({ top: 0, behavior: 'smooth' });
            lastScrollCheck = now; // リセットして連続実行を防ぐ
          }
        }, 500);

        return () => clearInterval(checkScroll);
      }
    }
  }, [activeTab]);

  // 月歌生成開始ハンドラー
  const handleStartGeneration = () => {
    setShowWizard(true);
  };

  // フォームリセット時のハンドラー（導入画面に戻る）
  const handleResetToIntro = () => {
    clearSelections();
    setShowWizard(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="py-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ポイント
            </h2>

            {/* device_idがない場合のメッセージ */}
            {!deviceId && (
              <div className="mb-8 mx-auto max-w-md">
                <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-300/30 shadow-xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌙</div>
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">
                      月歌の生成はこちら
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                      あなたの感想から<br />
                      美しい月歌を作成できます
                    </p>
                    <button
                      onClick={() => handleTabChange('tsukiuta')}
                      className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105"
                    >
                      月歌を作る →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ポイントカード表示 */}
            <div className="mb-8">
              <PointsCard
                points={userPoints}
                isLoading={isLoadingPoints}
                deviceId={deviceId}
                deviceIdExistsInDB={deviceIdExistsInDB}
              />
            </div>
          </div>
        );
      case 'survey':
        return (
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-16 bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 z-20 flex flex-col overflow-hidden">
            {/* ヘッダー部分（固定） */}
            <div className="flex-shrink-0 pt-6 pb-4 px-4">
              <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                📝 アンケート
              </h2>
              <p className="text-center text-white/70 text-sm mt-2">
                体験についてのご感想をお聞かせください
              </p>
            </div>

            {/* Google Form（スクロール可能） */}
            <div id="survey-scroll-container" className="flex-1 px-4 pb-4 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-visible shadow-2xl border border-white/10">
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLScE-bM17iPQBQS8IhywEtF_P-gIQ0WLM0NOgDabikpXhluszw/viewform?embedded=true"
                    width="100%"
                    height="5000"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    title="月歌アンケート"
                    className="w-full block"
                    scrolling="no"
                    style={{ minHeight: '5000px', border: 'none', display: 'block' }}
                  >
                    読み込んでいます…
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        );
      case 'tsukiuta':
        if (!showWizard) {
          return (
            <TsukiutaIntro
              onStartGeneration={handleStartGeneration}
              userPoints={userPoints}
              isDisabled={deviceId && userPoints === 0}
            />
          );
        }
        return (
          <>
            <WizardForm
              generatedTsukiuta={generatedTsukiuta}
              isGenerating={isGenerating}
              onGenerate={generateTsukiuta}
              onReset={handleResetToIntro}
              onSendToMoon={sendTsukiutaToMoon}
              isSending={isSaving}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 text-white">
      {/* 背景の装飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full opacity-10 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pb-20 max-w-4xl">
        <Header />
        {renderContent()}
      </div>

      <BottomTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* デバッグパネル */}
      <DebugPanel
        currentDeviceId={deviceId}
        onDeviceIdChange={handleDebugDeviceIdChange}
        onRefreshPoints={fetchUserPoints}
      />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }

        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default TsukiutaGenerator;