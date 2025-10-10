import { useState, useEffect } from 'react';
import TsukiutaModel from '../models/TsukiutaModel';
import { getDeviceIdFromURL } from '../utils/deviceUtils';

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

  // ポイント管理状態
  const [deviceId, setDeviceId] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

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

  // ポイントを取得
  const fetchUserPoints = async () => {
    const currentDeviceId = getDeviceIdFromURL();
    if (!currentDeviceId || !isSupabaseConfigured) {
      setIsLoadingPoints(false);
      return;
    }

    setIsLoadingPoints(true);
    try {
      const points = await model.fetchPlayerPoints(currentDeviceId);
      setUserPoints(points);
      setDeviceId(currentDeviceId);
    } catch (error) {
      console.error('ポイント取得エラー:', error);
      setUserPoints(0);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  // ポイントをリセット（0に設定）
  const resetUserPoints = async () => {
    if (!deviceId || !isSupabaseConfigured) return;

    try {
      await model.resetPlayerPoints(deviceId);
      setUserPoints(0);
      console.log('✅ ポイントをリセットしました');
    } catch (error) {
      console.error('❌ ポイントリセットエラー:', error);
      throw error;
    }
  };

  // 月歌を生成（送信はしない）
  const generateTsukiuta = async (feelings) => {
    // WizardFormから渡された感情を使用、またはselectedFeelingsフォールバック
    const feelingsToUse = feelings || selectedFeelings;
    if (feelingsToUse.length === 0) return;

    // ポイントチェック: 0ポイントの場合は生成不可
    if (userPoints === 0) {
      alert('ポイントが0のため、月歌を送ることができません。\n体験コンテンツでポイントを集めてください。');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await model.generateTsukiuta(feelingsToUse);
      // isSent フラグを追加（まだ送信していない状態）
      setGeneratedTsukiuta({ ...result, isSent: false });

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

  // 月歌を月に送る（Supabaseに保存 & ポイント消費）
  const sendTsukiutaToMoon = async () => {
    if (!generatedTsukiuta || generatedTsukiuta.isSent) return;

    setIsSaving(true);
    try {
      // Supabaseに保存
      await saveTsukiutaToDatabase(generatedTsukiuta);

      // ポイントをリセット（失敗時は月歌送信も失敗とする）
      console.log('🔄 ポイントをリセット中...');
      await resetUserPoints();

      // ポイントリセット後、DBから再取得して確認
      console.log('🔄 ポイントを再取得して確認中...');
      await fetchUserPoints();

      // 送信済みフラグを更新
      setGeneratedTsukiuta({ ...generatedTsukiuta, isSent: true });

      console.log('✅ 月歌を月に届けました');
    } catch (error) {
      console.error('❌ 月歌送信エラー:', error);
      alert(`月歌の送信に失敗しました: ${error.message}`);
    } finally {
      setIsSaving(false);
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
      // ポイント取得
      fetchUserPoints();
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

    // ポイント管理状態
    deviceId,
    userPoints,
    isLoadingPoints,

    // アクション
    selectFeeling,
    addCustomFeeling,
    generateTsukiuta,
    sendTsukiutaToMoon,
    fetchRecentTsukiutas,
    saveTsukiutaToDatabase,
    updateConfiguration,
    resetConfiguration,
    toggleHistory,
    clearSelections,
    updateUnityConfiguration,
    fetchUserPoints,
    resetUserPoints,

    // 値設定
    setCustomFeeling
  };
};