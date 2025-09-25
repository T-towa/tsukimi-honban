// Unity通知サービス
class UnityNotificationService {
  constructor() {
    this.unityServerUrl = process.env.REACT_APP_UNITY_SERVER_URL || 'http://localhost:3002';
    this.enabled = process.env.REACT_APP_UNITY_INTEGRATION_ENABLED === 'true';
  }

  // Unityサーバーの接続状態を確認
  async checkUnityConnection() {
    if (!this.enabled) {
      return { connected: false, reason: 'Unity integration disabled' };
    }

    try {
      const response = await fetch(`${this.unityServerUrl}/unity/status`, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const status = await response.json();
        return {
          connected: status.connected,
          clientCount: status.clientCount,
          timestamp: status.timestamp
        };
      }

      return { connected: false, reason: 'Unity server not responding' };
    } catch (error) {
      console.error('Unity connection check failed:', error);
      return { connected: false, reason: error.message };
    }
  }

  // 月歌データをUnityに送信
  async sendTsukiutaToUnity(tsukiutaData) {
    if (!this.enabled) {
      console.log('Unity integration is disabled');
      return { success: false, reason: 'Unity integration disabled' };
    }

    try {
      // 月歌データをUnity用にフォーマット
      const unityData = this.formatTsukiutaForUnity(tsukiutaData);

      const response = await fetch(`${this.unityServerUrl}/unity/send-tsukiuta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tsukiuta: unityData }),
        timeout: 10000
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Successfully sent tsukiuta to Unity:', result);
        return {
          success: true,
          sentToClients: result.sentToClients,
          message: result.message
        };
      }

      const error = await response.json();
      console.error('Failed to send tsukiuta to Unity:', error);
      return { success: false, reason: error.error || 'Unknown error' };

    } catch (error) {
      console.error('Error sending tsukiuta to Unity:', error);
      return { success: false, reason: error.message };
    }
  }

  // 月歌データをUnity用にフォーマット
  formatTsukiutaForUnity(tsukiutaData) {
    return {
      id: tsukiutaData.id || Date.now().toString(),
      tsukiuta: tsukiutaData.tsukiuta,
      lines: {
        line1: tsukiutaData.line1,
        line2: tsukiutaData.line2,
        line3: tsukiutaData.line3
      },
      syllables: {
        line1: tsukiutaData.syllables_line1,
        line2: tsukiutaData.syllables_line2,
        line3: tsukiutaData.syllables_line3
      },
      reading: tsukiutaData.reading,
      impression: tsukiutaData.impression,
      metadata: {
        createdAt: tsukiutaData.created_at || new Date().toISOString(),
        source: 'web_app',
        version: '1.0'
      }
    };
  }

  // Unity統合の有効/無効を切り替え
  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('unity_integration_enabled', enabled.toString());
  }

  // Unity統合の状態を取得
  isEnabled() {
    return this.enabled;
  }

  // サーバーURLを設定
  setServerUrl(url) {
    this.unityServerUrl = url;
    localStorage.setItem('unity_server_url', url);
  }

  // 設定をローカルストレージから読み込み
  loadSettings() {
    const savedEnabled = localStorage.getItem('unity_integration_enabled');
    const savedUrl = localStorage.getItem('unity_server_url');

    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }

    if (savedUrl) {
      this.unityServerUrl = savedUrl;
    }
  }

  // 設定をローカルストレージに保存
  saveSettings() {
    localStorage.setItem('unity_integration_enabled', this.enabled.toString());
    localStorage.setItem('unity_server_url', this.unityServerUrl);
  }
}

// シングルトンインスタンス
const unityNotificationService = new UnityNotificationService();

// 初期化時に設定を読み込み
unityNotificationService.loadSettings();

export default unityNotificationService;