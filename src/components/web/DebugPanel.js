import React, { useState } from 'react';
import { setDeviceId } from '../../utils/deviceUtils';

const DebugPanel = ({ currentDeviceId, onDeviceIdChange, onRefreshPoints }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputDeviceId, setInputDeviceId] = useState('');
  const [unityApiResult, setUnityApiResult] = useState(null);
  const [isTestingUnityApi, setIsTestingUnityApi] = useState(false);

  // サンプルデバイスID (本番環境用)
  const sampleDeviceIds = [
    'B8:27:EB:82:24:23'
  ];

  const handleSetDeviceId = () => {
    if (inputDeviceId.trim()) {
      setDeviceId(inputDeviceId.trim());
      if (onDeviceIdChange) {
        onDeviceIdChange();
      }
      setInputDeviceId('');
    }
  };

  const handleUseSampleId = (sampleId) => {
    setDeviceId(sampleId);
    if (onDeviceIdChange) {
      onDeviceIdChange();
    }
  };

  const handleClearDeviceId = () => {
    localStorage.removeItem('device_id');
    if (onDeviceIdChange) {
      onDeviceIdChange();
    }
  };

  // Unity APIテスト
  const handleTestUnityApi = async () => {
    setIsTestingUnityApi(true);
    setUnityApiResult(null);

    try {
      const response = await fetch('/api/get-pending-tsukiutas');
      const data = await response.json();

      setUnityApiResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setUnityApiResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingUnityApi(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* トグルボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-yellow-500/80 hover:bg-yellow-600/80 text-black font-bold py-2 px-4 rounded-full shadow-lg transition-all"
      >
        🛠️ Debug
      </button>

      {/* デバッグパネル */}
      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-yellow-500/50 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-400">🛠️ デバッグモード</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* 現在のデバイスID */}
          <div className="mb-6 bg-white/10 rounded-lg p-4">
            <div className="text-sm text-white/70 mb-1">現在のデバイスID</div>
            <div className="font-mono text-sm text-white break-all">
              {currentDeviceId || '未設定'}
            </div>
            {currentDeviceId && (
              <button
                onClick={handleClearDeviceId}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
              >
                🗑️ クリア
              </button>
            )}
          </div>

          {/* デバイスID手動入力 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white/90 mb-2">
              デバイスIDを手動設定
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputDeviceId}
                onChange={(e) => setInputDeviceId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetDeviceId()}
                placeholder="例: AA:BB:CC:DD:EE:FF"
                className="flex-1 bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={handleSetDeviceId}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                設定
              </button>
            </div>
          </div>

          {/* サンプルID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white/90 mb-2">
              サンプルデバイスID (クリックで設定)
            </label>
            <div className="space-y-2">
              {sampleDeviceIds.map((sampleId, index) => (
                <button
                  key={index}
                  onClick={() => handleUseSampleId(sampleId)}
                  className="w-full text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono text-white/90 transition-colors break-all"
                >
                  {sampleId}
                </button>
              ))}
            </div>
          </div>

          {/* ポイント更新ボタン */}
          <div className="mb-4">
            <button
              onClick={onRefreshPoints}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              🔄 ポイントを再取得
            </button>
          </div>

          {/* Unity APIテスト */}
          <div className="mb-6 border-t border-white/20 pt-6">
            <label className="block text-sm font-semibold text-white/90 mb-2">
              🎮 Unity API テスト
            </label>
            <button
              onClick={handleTestUnityApi}
              disabled={isTestingUnityApi}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isTestingUnityApi ? '🔄 テスト中...' : '📡 Unity API を呼び出す'}
            </button>

            {/* API結果表示 */}
            {unityApiResult && (
              <div className="mt-3 bg-black/50 rounded-lg p-3 max-h-60 overflow-y-auto">
                <div className="text-xs font-mono text-white/80 space-y-1">
                  <div className={`font-semibold ${unityApiResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {unityApiResult.success ? '✅ 成功' : '❌ 失敗'}
                  </div>
                  <div className="text-white/60">Status: {unityApiResult.status}</div>
                  {unityApiResult.data && (
                    <>
                      <div className="text-white/60">件数: {unityApiResult.data.count || 0}</div>
                      {unityApiResult.data.tsukiutas && unityApiResult.data.tsukiutas.length > 0 && (
                        <div className="mt-2 text-white/80">
                          <div className="font-semibold mb-1">送信された月歌:</div>
                          {unityApiResult.data.tsukiutas.map((t, i) => (
                            <div key={i} className="ml-2 text-xs border-l-2 border-purple-500 pl-2 py-1">
                              {t.tsukiuta}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {unityApiResult.error && (
                    <div className="text-red-400">Error: {unityApiResult.error}</div>
                  )}
                  <div className="text-white/40 text-xs mt-2">
                    {new Date(unityApiResult.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
            <div className="text-xs text-yellow-200">
              <strong>⚠️ 注意:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>本番環境では非表示推奨</li>
                <li>ポイントはSupabaseから取得</li>
                <li>device_idはLocalStorageに保存</li>
                <li>Unity APIは5秒間隔でポーリング</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
