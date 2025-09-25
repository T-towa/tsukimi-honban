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
  const [showConfig, setShowConfig] = useState(false);

  // Modelインスタンス
  const [model] = useState(() => new TsukiutaModel());

  // 定数（環境変数から設定を取得）
  const maxFeelings = parseInt(process.env.REACT_APP_MAX_FEELINGS) || 3;
  const customFeelingMaxLength = parseInt(process.env.REACT_APP_CUSTOM_FEELING_MAX_LENGTH) || 50;

  const predefinedFeelings = [
    '美しい月明かり',
    '幻想的な光',
    '秋の涼しさ',
    '懐かしい思い出',
    '静寂な時間',
    '心の安らぎ',
    '竹取物語の世界',
    '金沢の夜景',
    '家族との時間',
    '特別な瞬間'
  ];

  // Supabaseから最新の月歌を取得
  const fetchRecentTsukiutas = async () => {
    const data = await model.fetchTsukiutas();
    setRecentTsukiutas(data);
  };

  // 月歌生成（ウィザード形式対応）
  const generateTsukiuta = async (feelings = null) => {
    // feelings引数がある場合はウィザード形式から、ない場合は従来形式から
    let feelingsToUse = feelings;

    if (!feelingsToUse) {
      if (selectedFeelings.length === 0 && !customFeeling.trim()) {
        alert('感想を選択するか入力してください');
        return;
      }

      feelingsToUse = [...selectedFeelings];
      if (customFeeling.trim()) {
        feelingsToUse.push(customFeeling.trim());
      }
    } else if (feelingsToUse.length === 0) {
      alert('感想を入力してください');
      return;
    }

    setIsGenerating(true);
    setShowAnimation(false);

    try {
      // Model経由で月歌生成
      const tsukiutaData = await model.generateTsukiuta(feelingsToUse);

      // 生成された月歌を設定
      setGeneratedTsukiuta(tsukiutaData);
      setShowAnimation(true);

      // データベースに保存（explanation は除外、reading は含む）
      const dbData = {
        impression: tsukiutaData.impression,
        tsukiuta: tsukiutaData.tsukiuta,
        line1: tsukiutaData.line1,
        line2: tsukiutaData.line2,
        line3: tsukiutaData.line3,
        syllables_line1: tsukiutaData.syllables_line1,
        syllables_line2: tsukiutaData.syllables_line2,
        syllables_line3: tsukiutaData.syllables_line3,
        reading: tsukiutaData.reading
      };

      await saveTsukiutaToDatabase(dbData);

    } catch (error) {
      console.error('Error generating tsukiuta:', error);
      alert('月歌の生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  // データベースに保存
  const saveTsukiutaToDatabase = async (tsukiutaData) => {
    setIsSaving(true);
    try {
      const savedData = await model.saveTsukiuta(tsukiutaData);
      if (savedData && savedData.id) {
        console.log(`月歌がデータベースに保存されました (ID: ${savedData.id})`);
        await fetchRecentTsukiutas(); // リストを更新
      }
    } catch (error) {
      console.error('Error saving tsukiuta:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 感想選択のトグル
  const toggleFeeling = (feeling) => {
    setSelectedFeelings(prev => {
      if (prev.includes(feeling)) {
        return prev.filter(f => f !== feeling);
      } else if (prev.length < maxFeelings) {
        return [...prev, feeling];
      }
      return prev;
    });
  };

  // リセット
  const resetForm = () => {
    setSelectedFeelings([]);
    setCustomFeeling('');
    setGeneratedTsukiuta(null);
    setShowAnimation(false);
  };

  // 環境変数の設定状態を取得
  const getEnvironmentConfig = () => {
    return model.getConfiguration();
  };

  // Supabase設定を保存
  const saveSupabaseConfig = () => {
    const configured = model.configure(supabaseUrl, supabaseAnonKey);
    if (configured) {
      setIsSupabaseConfigured(true);
      setShowConfig(false);
      fetchRecentTsukiutas();
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
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured,
    showConfig,
    predefinedFeelings,
    maxFeelings,
    customFeelingMaxLength,

    // アクション
    setCustomFeeling,
    setShowHistory,
    setSupabaseUrl,
    setSupabaseAnonKey,
    setShowConfig,
    generateTsukiuta,
    toggleFeeling,
    resetForm,
    saveSupabaseConfig,
    getEnvironmentConfig
  };
};