import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Send, RefreshCw, Loader2, Edit } from 'lucide-react';

const WizardForm = ({
  generatedTsukiuta,
  isGenerating,
  onGenerate,
  onReset,
  onSendToMoon,
  isSending = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({
    atmosphere: '',
    content: '',
    impression: '',
    customAtmosphere: '',
    customContent: '',
    customImpression: ''
  });

  const atmosphereOptions = [
    '幻想的で神秘的',
    '静寂で穏やか',
    '賑やかで楽しい',
    'ロマンチック',
    '懐かしく温かい'
  ];

  const contentOptions = [
    'プロジェクションマッピング',
    'ライトアップされた庭園',
    'あかりオブジェ',
    'あかりづくりワークショップ',
    '竹取物語の5つの体験'
  ];

  const impressionOptions = [
    'かぐや姫の世界に入り込んだよう',
    '月の美しさに心が洗われた',
    '大切な人との特別な時間',
    '金沢の新しい魅力を発見',
    '日常を忘れる幻想的なひととき'
  ];

  const handleOptionSelect = (field, value) => {
    setStepData(prev => ({
      ...prev,
      [field]: value,
      [`custom${field.charAt(0).toUpperCase() + field.slice(1)}`]: ''
    }));
  };

  const handleCustomInput = (field, value) => {
    const maxLength = 50;
    if (value.length <= maxLength) {
      setStepData(prev => ({
        ...prev,
        [`custom${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
        [field]: ''
      }));
    }
  };

  const getSelectedValue = (field) => {
    const customField = `custom${field.charAt(0).toUpperCase() + field.slice(1)}`;
    return stepData[field] || stepData[customField];
  };

  const isStepComplete = (step) => {
    switch(step) {
      case 1:
        return !!(stepData.atmosphere || stepData.customAtmosphere);
      case 2:
        return !!(stepData.content || stepData.customContent);
      case 3:
        return !!(stepData.impression || stepData.customImpression);
      default:
        return true;
    }
  };

  const canProceed = () => {
    return isStepComplete(currentStep);
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateTsukiuta = () => {
    const feelings = [
      getSelectedValue('atmosphere'),
      getSelectedValue('content'),
      getSelectedValue('impression')
    ].filter(Boolean);

    onGenerate(feelings);
  };

  const handleNewTsukiuta = () => {
    setCurrentStep(1);
    setStepData({
      atmosphere: '',
      content: '',
      impression: '',
      customAtmosphere: '',
      customContent: '',
      customImpression: ''
    });
    onReset();
  };

  const renderStepIndicator = () => {
    const steps = 4;

    const getMoonPhase = (stepIndex) => {
      const isActive = stepIndex + 1 <= currentStep;
      const isCurrent = stepIndex + 1 === currentStep;

      // 基本の満月（完了・現在のステップ用）
      const baseMoon = (
        <div className={`w-12 h-12 rounded-full relative transition-all duration-500 ${
          isActive ? 'bg-gradient-to-br from-yellow-200 via-yellow-100 to-white' : 'bg-gray-700/50'
        }`}
        style={{
          boxShadow: isActive
            ? '0 0 25px rgba(255, 215, 0, 0.9), 0 0 50px rgba(255, 248, 220, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.4)'
            : '0 0 5px rgba(255, 255, 255, 0.2)'
        }}>
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 via-white to-yellow-50 opacity-80" />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-yellow-50 opacity-60" />
            </>
          )}
          {isCurrent && (
            <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-40 animate-ping" />
          )}
        </div>
      );

      if (!isActive) {
        // 未完了の場合は影のように暗く表示
        return (
          <div className="w-12 h-12 rounded-full bg-gray-700/30 relative transition-all duration-500"
          style={{ boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)' }}>
            {/* 月相の形状をほんのり表示 */}
            <div
              className="absolute inset-0 rounded-full bg-gray-600/20"
              style={{
                clipPath: stepIndex === 0
                  ? 'circle(50% at 25% 50%)' // 三日月の形（小さい円）
                  : stepIndex === 1
                  ? 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'  // 半月
                  : stepIndex === 2
                  ? 'polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%)'  // 3/4月
                  : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'    // 満月
              }}
            />
          </div>
        );
      }

      // アクティブな場合の月相
      switch(stepIndex) {
        case 0: // 三日月
          return (
            <div className="w-12 h-12 relative transition-all duration-500 overflow-hidden rounded-full"
            style={{
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.7), 0 0 50px rgba(255, 248, 220, 0.4)'
            }}>
              {/* 背景の黒い円 */}
              <div className="absolute inset-0 rounded-full bg-gray-800" />
              {/* 三日月の形 */}
              <div
                className="absolute rounded-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-white"
                style={{
                  width: '48px',
                  height: '48px',
                  right: '0px',
                  top: '0px',
                  zIndex: 10
                }}
              />
              {/* 影の円で三日月の内側を削る */}
              <div
                className="absolute rounded-full bg-gray-800"
                style={{
                  width: '48px',
                  height: '48px',
                  right: '10px',
                  top: '0px',
                  zIndex: 11
                }}
              />
              {isCurrent && (
                <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-30 animate-ping" style={{ zIndex: 5 }} />
              )}
            </div>
          );

        case 1: // 半月
          return (
            <div className="w-12 h-12 rounded-full bg-gray-800 relative transition-all duration-500"
            style={{
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.8), 0 0 50px rgba(255, 248, 220, 0.5)'
            }}>
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-l from-yellow-200 via-yellow-100 to-white"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
                }}
              />
              {isCurrent && (
                <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-35 animate-ping" />
              )}
            </div>
          );

        case 2: // 3/4月
          return (
            <div className="w-12 h-12 rounded-full bg-gray-800 relative transition-all duration-500"
            style={{
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.85), 0 0 50px rgba(255, 248, 220, 0.6)'
            }}>
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-l from-yellow-200 via-yellow-100 to-white"
                style={{
                  clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%)'
                }}
              />
              {isCurrent && (
                <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-35 animate-ping" />
              )}
            </div>
          );

        case 3: // 満月
          return baseMoon;

        default:
          return baseMoon;
      }
    };

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          {[...Array(steps)].map((_, index) => (
            <React.Fragment key={index}>
              <div className={`relative`}>
                {getMoonPhase(index)}
              </div>
              {index < steps - 1 && (
                <div className={`w-8 h-0.5 transition-all duration-300 ${
                  index + 1 < currentStep
                    ? 'bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 shadow-md'
                    : 'bg-white/20'
                }`}
                style={{
                  boxShadow: index + 1 < currentStep
                    ? '0 0 15px rgba(255, 215, 0, 0.6)'
                    : 'none'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 1: 月見光路の雰囲気</h3>
            <div className="space-y-3">
              <p className="text-sm text-white/80 mb-3">【選択肢】</p>
              {atmosphereOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect('atmosphere', option)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all transform hover:scale-105 ${
                    stepData.atmosphere === option
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm text-white/80 mb-3">【または自由入力】</p>
              <input
                type="text"
                value={stepData.customAtmosphere}
                onChange={(e) => handleCustomInput('atmosphere', e.target.value)}
                placeholder="最大50文字で入力可能"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                maxLength={50}
              />
              <p className="text-xs text-white/60 mt-1 text-right">{stepData.customAtmosphere.length}/50</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 2: 体験したコンテンツ</h3>
            <div className="space-y-3">
              <p className="text-sm text-white/80 mb-3">【選択肢】</p>
              {contentOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect('content', option)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all transform hover:scale-105 ${
                    stepData.content === option
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm text-white/80 mb-3">【または自由入力】</p>
              <input
                type="text"
                value={stepData.customContent}
                onChange={(e) => handleCustomInput('content', e.target.value)}
                placeholder="最大50文字で入力可能"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                maxLength={50}
              />
              <p className="text-xs text-white/60 mt-1 text-right">{stepData.customContent.length}/50</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 3: 体験を通しての感想</h3>
            <div className="space-y-3">
              <p className="text-sm text-white/80 mb-3">【選択肢】</p>
              {impressionOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect('impression', option)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all transform hover:scale-105 ${
                    stepData.impression === option
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm text-white/80 mb-3">【または自由入力】</p>
              <input
                type="text"
                value={stepData.customImpression}
                onChange={(e) => handleCustomInput('impression', e.target.value)}
                placeholder="最大50文字で入力可能"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                maxLength={50}
              />
              <p className="text-xs text-white/60 mt-1 text-right">{stepData.customImpression.length}/50</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Step 4: 確認画面</h3>
            <div className="bg-white/10 rounded-lg p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-white/60 min-w-[120px]">月見光路の雰囲気:</p>
                  <p className="flex-1">{getSelectedValue('atmosphere')}</p>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm text-white/60 min-w-[120px]">体験したコンテンツ:</p>
                  <p className="flex-1">{getSelectedValue('content')}</p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm text-white/60 min-w-[120px]">体験を通しての感想:</p>
                  <p className="flex-1">{getSelectedValue('impression')}</p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (generatedTsukiuta) {
    return (
      <section className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Step 5: 月歌表示</h3>
        <div className="bg-white/10 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              あなたの月歌
            </h4>
            <div className="space-y-2 text-xl font-serif">
              <p>{generatedTsukiuta.line1}</p>
              <p>{generatedTsukiuta.line2}</p>
              <p>{generatedTsukiuta.line3}</p>
            </div>
            {generatedTsukiuta.reading && (
              <div className="mt-4 text-sm text-white/70 space-y-1">
                <p className="font-sans">ひらがな読み:</p>
                <p className="text-base">{generatedTsukiuta.reading}</p>
              </div>
            )}
            <div className="mt-4 text-xs text-white/60">
              音数: {generatedTsukiuta.syllables_line1}-{generatedTsukiuta.syllables_line2}-{generatedTsukiuta.syllables_line3}
            </div>
          </div>

          {/* 月歌を送るボタン */}
          <button
            onClick={onSendToMoon}
            disabled={isSending || generatedTsukiuta.isSent}
            className={`w-full mt-6 px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all transform ${
              generatedTsukiuta.isSent
                ? 'bg-green-600/50 cursor-not-allowed'
                : isSending
                ? 'bg-purple-500/50 cursor-wait'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:scale-105 shadow-lg'
            }`}
            style={
              !generatedTsukiuta.isSent && !isSending
                ? {
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(249, 115, 22, 0.3)'
                  }
                : {}
            }
          >
            {generatedTsukiuta.isSent ? (
              <>
                <span className="text-2xl">✓</span>
                月に届けました
              </>
            ) : isSending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                月に届けています...
              </>
            ) : (
              <>
                <span className="text-2xl">🌙</span>
                月歌を月に届ける
              </>
            )}
          </button>

          {/* 新しい月歌を作るボタン */}
          <button
            onClick={handleNewTsukiuta}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            新しい月歌を作る
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>

      <section className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
        {renderStepIndicator()}

        <div className="min-h-[400px]">
          {renderStep()}
        </div>

      <div className="flex gap-4 mt-8">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            戻る
          </button>
        )}

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            次へ
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleGenerateTsukiuta}
            disabled={isGenerating}
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
        )}
      </div>
    </section>
    </>
  );
};

export default WizardForm;