import { useState, useEffect } from 'react';
import TsukiutaModel from '../models/TsukiutaModel';

// Controller層 - ビジネスロジックと状態管理
export const useTsukiutaController = () => {
  // 状態管理
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [customFeeling, setCustomFeeling] = useState('');
  const [generatedTsukiuta, setGeneratedTsukiuta] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentTsukiutas, setRecentTsukiutas] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Supabase設定状態
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Unity設定状態
  const [unityEndpoint, setUnityEndpoint] = useState('');
  const [unityEnabled, setUnityEnabled] = useState(false);

  // Model層のインスタンス
  const model = new TsukiutaModel();

  // 感想を選択
  const selectFeeling = (feeling) => {
    const maxFeelings = parseInt(process.env.REACT_APP_MAX_FEELINGS || '3');

    if (selectedFeelings.includes(feeling)) {
      setSelectedFeelings(prev => prev.filter(f => f !== feeling));
    } else if (selectedFeelings.length < maxFeelings) {
      setSelectedFeelings(prev => [...prev, feeling]);
    }
  };

  // カスタム感想を追加
  const addCustomFeeling = () => {
    const maxLength = parseInt(process.env.REACT_APP_CUSTOM_FEELING_MAX_LENGTH || '50');
    const maxFeelings = parseInt(process.env.REACT_APP_MAX_FEELINGS || '3');

    if (customFeeling.trim() &&
        customFeeling.length <= maxLength &&
        !selectedFeelings.includes(customFeeling.trim()) &&
        selectedFeelings.length < maxFeelings) {
      setSelectedFeelings(prev => [...prev, customFeeling.trim()]);
      setCustomFeeling('');
    }
  };

  // 月歌を生成
  const generateTsukiuta = async (feelings) => {
    // WizardFormから渡された感情を使用、またはselectedFeelingsフォールバック
    const feelingsToUse = feelings || selectedFeelings;
    if (feelingsToUse.length === 0) return;

    setIsGenerating(true);
    try {
      const result = await model.generateTsukiuta(feelingsToUse);
      setGeneratedTsukiuta(result);

      // Unityに通知を送信（設定されている場合）
      if (unityEnabled && unityEndpoint) {
        try {
          const unityResult = await model.notifyUnity(result, unityEndpoint);
          if (unityResult.success) {
            console.log('月歌をUnityに送信しました');
          } else {
            console.warn('Unity通知に失敗:', unityResult.message);
          }
        } catch (unityError) {
          console.error('Unity通知エラー:', unityError);
        }
      }

      // Supabaseに保存（環境変数が設定されていれば自動保存）
      try {
        await saveTsukiutaToDatabase(result);
      } catch (saveError) {
        console.error('Supabase保存エラー:', saveError);
        // 保存エラーでもメイン処理は継続
      }

      // アニメーション表示
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);

    } catch (error) {
      console.error('Error generating tsukiuta:', error);
      alert(`月歌の生成に失敗しました: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 最近の月歌を取得
  const fetchRecentTsukiutas = async () => {
    if (!isSupabaseConfigured) {
      // Supabaseが設定されていない場合はローカルデータを表示
      const localData = model.getLocalTsukiutas();
      setRecentTsukiutas(localData);
      return;
    }

    try {
      const data = await model.fetchTsukiutas();

      // データベースのデータとローカルデータをマージ
      const localData = model.getLocalTsukiutas();
      const mergedData = [...data, ...localData].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      setRecentTsukiutas(mergedData);
    } catch (error) {
      console.error('Error fetching tsukiutas:', error);
      // エラー時はローカルデータのみ表示
      const localData = model.getLocalTsukiutas();
      setRecentTsukiutas(localData);
    }
  };

  // データベースに月歌を保存
  const saveTsukiutaToDatabase = async (tsukiutaData) => {
    if (!tsukiutaData) return;

    // Supabase設定が存在しない場合はスキップ（ローカル保存のみ）
    if (!model.isConfigured) {
      console.log('Supabase未設定のためDB保存をスキップ（ローカル保存済み）');
      return;
    }

    setIsSaving(true);
    try {
      const savedData = await model.saveTsukiuta(tsukiutaData);

      if (savedData && savedData.id) {
        console.log(`✅ 月歌がデータベースに保存されました (ID: ${savedData.id})`);
        await fetchRecentTsukiutas(); // リストを更新
      } else {
        console.warn('⚠️ データベース保存に失敗: レスポンスが空です');
      }
    } catch (error) {
      console.error('❌ Error saving tsukiuta:', error);
      throw error; // エラーを上位に伝播
    } finally {
      setIsSaving(false);
    }
  };

  // 設定を更新
  const updateConfiguration = (url, key) => {
    if (model.configure(url, key)) {
      setIsSupabaseConfigured(true);
      setSupabaseUrl(url);
      setSupabaseAnonKey(key);
      fetchRecentTsukiutas();
    }
  };

  // 設定をリセット
  const resetConfiguration = () => {
    setIsSupabaseConfigured(false);
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setRecentTsukiutas([]);
  };

  // 履歴表示の切り替え
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  // 選択をクリア
  const clearSelections = () => {
    setSelectedFeelings([]);
    setCustomFeeling('');
    setGeneratedTsukiuta(null);
  };

  // Unity設定を更新
  const updateUnityConfiguration = (endpoint, enabled) => {
    setUnityEndpoint(endpoint);
    setUnityEnabled(enabled);

    // LocalStorageに保存
    try {
      localStorage.setItem('unity_config', JSON.stringify({
        endpoint: endpoint,
        enabled: enabled
      }));
    } catch (error) {
      console.error('Unity設定の保存に失敗:', error);
    }
  };

  // Unity設定をロード
  const loadUnityConfiguration = () => {
    try {
      const savedConfig = localStorage.getItem('unity_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setUnityEndpoint(config.endpoint || '');
        setUnityEnabled(config.enabled || false);
      }
    } catch (error) {
      console.error('Unity設定の読み込みに失敗:', error);
    }
  };

  // 初回読み込み時の設定確認と月歌取得
  useEffect(() => {
    // 環境変数から設定を確認
    const envConfig = model.getConfiguration();
    if (envConfig.hasEnvConfig && !isSupabaseConfigured) {
      setIsSupabaseConfigured(true);
      setSupabaseUrl(envConfig.supabaseUrl);
    }

    // Unity設定をロード
    loadUnityConfiguration();

    if (isSupabaseConfigured) {
      fetchRecentTsukiutas();
    }
  }, [isSupabaseConfigured]);

  return {
    // 状態
    selectedFeelings,
    customFeeling,
    generatedTsukiuta,
    isGenerating,
    recentTsukiutas,
    showAnimation,
    isSaving,
    showHistory,

    // Supabase設定状態
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured,

    // Unity設定状態
    unityEndpoint,
    unityEnabled,

    // アクション
    selectFeeling,
    addCustomFeeling,
    generateTsukiuta,
    fetchRecentTsukiutas,
    saveTsukiutaToDatabase,
    updateConfiguration,
    resetConfiguration,
    toggleHistory,
    clearSelections,
    updateUnityConfiguration,

    // 値設定
    setCustomFeeling
  };
};