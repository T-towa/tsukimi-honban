import React, { useEffect, useState } from 'react';

const UnityStatus = ({
  unityConnected,
  unityClientCount,
  checkUnityConnection,
  toggleUnityIntegration
}) => {
  const [isEnabled, setIsEnabled] = useState(false);

  // 初回読み込み時にUnity統合の状態を確認
  useEffect(() => {
    // UnityNotificationServiceの状態を確認する処理が必要
    // 今は単純にunityConnectedの状態で判断
    setIsEnabled(unityConnected);
  }, [unityConnected]);

  // 定期的に接続状態を確認
  useEffect(() => {
    if (isEnabled) {
      const interval = setInterval(checkUnityConnection, 30000); // 30秒間隔
      return () => clearInterval(interval);
    }
  }, [checkUnityConnection, isEnabled]);

  const handleToggleIntegration = (enabled) => {
    setIsEnabled(enabled);
    toggleUnityIntegration(enabled);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Unity連携</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">統合を有効にする</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={(e) => handleToggleIntegration(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">接続状態:</span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                unityConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className={`text-sm font-medium ${
              unityConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {unityConnected ? '接続中' : '切断中'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">接続クライアント数:</span>
          <span className="text-sm font-medium text-gray-800">
            {unityClientCount} クライアント
          </span>
        </div>

        <button
          onClick={checkUnityConnection}
          className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          接続状態を確認
        </button>

        {isEnabled && unityConnected && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Unity統合が有効です。新しい月歌が生成されると、自動的にUnityクライアントに送信されます。
            </p>
          </div>
        )}

        {isEnabled && !unityConnected && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠ Unityサーバーに接続されていません。Unity統合を使用するには、Unityサーバーが起動している必要があります。
            </p>
          </div>
        )}

        {!isEnabled && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600">
              Unity統合は無効です。有効にするには上のスイッチをオンにしてください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnityStatus;