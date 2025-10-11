import React, { useState } from 'react';
import { useTsukiutaController } from './controllers/TsukiutaController';
import Header from './components/web/Header';
import WizardForm from './components/web/WizardForm';
import TsukiutaIntro from './components/web/TsukiutaIntro';
import ShareSection from './components/web/ShareSection';
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

            {/* ポイントカード表示 */}
            <div className="mb-8">
              <PointsCard
                points={userPoints}
                isLoading={isLoadingPoints}
                deviceId={deviceId}
              />
            </div>
          </div>
        );
      case 'survey':
        return (
          <div className="py-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              アンケート
            </h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
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
          </div>
        );
      case 'tsukiuta':
        if (!showWizard) {
          return (
            <TsukiutaIntro
              onStartGeneration={handleStartGeneration}
              userPoints={userPoints}
              isDisabled={userPoints === 0}
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

            {generatedTsukiuta && generatedTsukiuta.isSent && (
              <ShareSection tsukiuta={generatedTsukiuta} />
            )}
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