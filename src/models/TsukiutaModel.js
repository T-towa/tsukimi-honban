// Model層 - データ管理とAPI操作（Web版）
class TsukiutaModel {
  constructor() {
    // 環境変数から設定を読み込み
    this.supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    this.claudeApiKey = process.env.REACT_APP_CLAUDE_API_KEY || '';
    this.claudeApiUrl = process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    this.claudeModel = process.env.REACT_APP_CLAUDE_MODEL || 'claude-sonnet-4-20250514';

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
    if (!this.isConfigured) return null;

    // IDは除外してデータベースに送信（自動採番のため）
    const { id, isLocal, ...dataToSave } = tsukiutaData;

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
        console.log('データベース保存成功:', savedData[0]?.id ? `ID: ${savedData[0].id}` : '保存完了');
        return savedData[0]; // 自動採番されたIDを含むデータを返す
      }
      throw new Error('データベース保存に失敗しました');
    } catch (error) {
      console.error('Error saving tsukiuta:', error);
      return null;
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

  // Claude APIで月歌生成（プロキシサーバー経由）
  async generateTsukiuta(feelings) {
    try {
      // プロキシサーバー経由でClaude APIを呼び出す
      const response = await fetch('http://localhost:3001/api/generate-tsukiuta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feelings })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
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
        throw new Error('サーバーに接続できません。server.jsが起動していることを確認してください。');
      }
      throw error;
    }
  }
}

export default TsukiutaModel;