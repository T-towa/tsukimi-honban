// Model層 - データ管理とAPI操作（Web版）
class TsukiutaModel {
  constructor() {
    // 環境変数から設定を読み込み
    this.supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    this.claudeApiKey = process.env.REACT_APP_CLAUDE_API_KEY || '';
    this.claudeApiUrl = process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    this.claudeModel = process.env.REACT_APP_CLAUDE_MODEL || 'claude-sonnet-4-20250514';

    // デバッグ用：バックエンドAPI使用のためClaude API設定は不要
    console.log('🔧 設定チェック:');
    console.log('SUPABASE_URL:', this.supabaseUrl ? `設定済み (${this.supabaseUrl.substring(0, 20)}...)` : '未設定');
    console.log('SUPABASE_ANON_KEY:', this.supabaseAnonKey ? `設定済み (${this.supabaseAnonKey.substring(0, 10)}...)` : '未設定');
    console.log('月歌生成:', 'バックエンドAPI経由で実行');
    console.log('API URL:', '/api/generate-tsukiuta');

    // 環境変数が設定されていればデフォルトで有効化
    this.isConfigured = !!(this.supabaseUrl && this.supabaseAnonKey);

    // LocalStorageから設定を読み込み
    this.loadStoredConfig();
  }

  // LocalStorageから保存された設定を読み込み
  loadStoredConfig() {
    try {
      const storedConfig = localStorage.getItem('tsukiuta_config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        this.supabaseUrl = config.supabaseUrl || this.supabaseUrl;
        this.supabaseAnonKey = config.supabaseAnonKey || this.supabaseAnonKey;
        this.claudeApiKey = config.claudeApiKey || this.claudeApiKey;
        this.isConfigured = !!(this.supabaseUrl && this.supabaseAnonKey);
      }
    } catch (error) {
      console.log('設定の読み込みエラー:', error);
    }
  }

  // 設定をLocalStorageに保存
  saveConfig() {
    try {
      const config = {
        supabaseUrl: this.supabaseUrl,
        supabaseAnonKey: this.supabaseAnonKey,
        claudeApiKey: this.claudeApiKey,
      };
      localStorage.setItem('tsukiuta_config', JSON.stringify(config));
    } catch (error) {
      console.log('設定の保存エラー:', error);
    }
  }

  // Supabase設定（環境変数を上書きする場合）
  configure(url, key, claudeKey = null) {
    this.supabaseUrl = url || this.supabaseUrl;
    this.supabaseAnonKey = key || this.supabaseAnonKey;
    if (claudeKey) this.claudeApiKey = claudeKey;

    this.isConfigured = !!(this.supabaseUrl && this.supabaseAnonKey);

    if (this.isConfigured) {
      this.saveConfig();
    }

    return this.isConfigured;
  }

  // 現在の設定状態を取得
  getConfiguration() {
    return {
      supabaseUrl: this.supabaseUrl,
      supabaseAnonKey: this.supabaseAnonKey ? '***設定済み***' : '',
      claudeApiKey: this.claudeApiKey ? '***設定済み***' : '',
      isConfigured: this.isConfigured,
      hasEnvConfig: !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY),
      hasStoredConfig: !!(this.supabaseUrl && this.supabaseAnonKey)
    };
  }

  // 月歌をデータベースから取得
  async fetchTsukiutas(limit = null) {
    if (!this.isConfigured) return [];

    const queryLimit = limit || process.env.REACT_APP_HISTORY_LIMIT || 10;

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/tsukiutas?order=created_at.desc&limit=${queryLimit}`, {
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('データの取得に失敗しました');
    } catch (error) {
      console.error('Error fetching tsukiutas:', error);
      return [];
    }
  }

  // 月歌をデータベースに保存（IDは自動採番）
  async saveTsukiuta(tsukiutaData) {
    if (!this.isConfigured) {
      console.log('⚠️ Supabase未設定: データベース保存をスキップします');
      return null;
    }

    // IDは除外してデータベースに送信（自動採番のため）
    const { id, isLocal, ...dataToSave } = tsukiutaData;

    console.log('💾 Supabaseへ保存開始...', {
      url: this.supabaseUrl,
      hasKey: !!this.supabaseAnonKey,
      data: dataToSave
    });

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/tsukiutas`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('✅ データベース保存成功:', savedData[0]?.id ? `ID: ${savedData[0].id}` : '保存完了', savedData[0]);
        return savedData[0]; // 自動採番されたIDを含むデータを返す
      } else {
        const errorText = await response.text();
        console.error('❌ データベース保存エラー:', response.status, errorText);
        throw new Error(`データベース保存に失敗しました (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error saving tsukiuta:', error);
      throw error; // エラーを上位に伝播
    }
  }

  // ローカルストレージに月歌を保存（オフライン対応）
  saveToLocalStorage(tsukiutaData) {
    try {
      const existingData = localStorage.getItem('local_tsukiutas');
      const tsukiutas = existingData ? JSON.parse(existingData) : [];

      const newTsukiuta = {
        ...tsukiutaData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        isLocal: true
      };

      tsukiutas.unshift(newTsukiuta);

      // 最大50件まで保持
      if (tsukiutas.length > 50) {
        tsukiutas.splice(50);
      }

      localStorage.setItem('local_tsukiutas', JSON.stringify(tsukiutas));
      return true;
    } catch (error) {
      console.error('ローカル保存エラー:', error);
      return false;
    }
  }

  // ローカルストレージから月歌を取得
  getLocalTsukiutas() {
    try {
      const existingData = localStorage.getItem('local_tsukiutas');
      return existingData ? JSON.parse(existingData) : [];
    } catch (error) {
      console.error('ローカル読み込みエラー:', error);
      return [];
    }
  }

  // バックエンドAPI経由で月歌生成
  async generateTsukiuta(feelings) {
    try {
      console.log('Sending request to backend API...');

      // バックエンドAPIエンドポイントを呼び出し
      const response = await fetch('/api/generate-tsukiuta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feelings })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend API Error:', errorData);
        throw new Error(errorData.error || '月歌の生成に失敗しました');
      }

      const result = await response.json();
      console.log('月歌生成成功:', result);

      // ローカルにも保存
      this.saveToLocalStorage(result);

      return result;
    } catch (error) {
      console.error('Error generating tsukiuta:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('サーバーに接続できません。しばらくしてから再試行してください。');
      }
      throw error;
    }
  }

  // Unityに月歌データを送信
  async notifyUnity(tsukiutaData, unityEndpoint) {
    if (!unityEndpoint) {
      console.log('Unity endpoint not specified, skipping Unity notification');
      return { success: false, reason: 'Unity endpoint not specified' };
    }

    try {
      console.log('Sending tsukiuta to Unity via backend API...');

      const response = await fetch('/api/notify-unity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tsukiuta: tsukiutaData,
          unityEndpoint: unityEndpoint
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Unity通知成功:', result);
        return {
          success: true,
          message: result.message,
          unityResponse: result.unityResponse
        };
      } else {
        const errorData = await response.json();
        console.error('Unity通知エラー:', errorData);
        return {
          success: false,
          error: errorData.error,
          message: errorData.message
        };
      }

    } catch (error) {
      console.error('Unity通知リクエストエラー:', error);
      return {
        success: false,
        error: 'Network error',
        message: error.message
      };
    }
  }

  // プレイヤーのポイントを取得
  async fetchPlayerPoints(deviceId) {
    if (!this.isConfigured) {
      console.log('⚠️ Supabase未設定: ポイント取得をスキップします');
      return 0;
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/players?device_id=eq.${encodeURIComponent(deviceId)}&select=points`,
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          console.log('✅ ポイント取得成功:', data[0].points);
          return data[0].points || 0;
        } else {
          console.log('⚠️ プレイヤーが見つかりません:', deviceId);
          return 0;
        }
      } else {
        const errorText = await response.text();
        console.error('❌ ポイント取得エラー:', response.status, errorText);
        return 0;
      }
    } catch (error) {
      console.error('❌ Error fetching player points:', error);
      return 0;
    }
  }

  // プレイヤーのポイントをリセット（0に設定）
  async resetPlayerPoints(deviceId) {
    if (!this.isConfigured) {
      console.log('⚠️ Supabase未設定: ポイントリセットをスキップします');
      return false;
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/players?device_id=eq.${encodeURIComponent(deviceId)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ points: 0 })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ポイントリセット成功:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ ポイントリセットエラー:', response.status, errorText);
        throw new Error(`ポイントリセットに失敗しました (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error resetting player points:', error);
      throw error;
    }
  }
}

export default TsukiutaModel;