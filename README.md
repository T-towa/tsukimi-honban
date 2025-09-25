# 月歌 -つきうた- Web App

金澤月見光路イベント用の月歌（5-7-5短詩）生成Webアプリケーション

## 🎯 イベント用Webアプリ

**当日はURLアクセスで手軽に月歌体験！**
アプリのダウンロードやインストール不要で、ブラウザから直接アクセスできます。

### 🌟 イベント特化機能
- 📱 **URL共有**: QRコードやリンクで簡単シェア
- 🎪 **PWA対応**: ホーム画面に追加してアプリライクに使用
- 🤝 **ソーシャル連携**: Twitter、LINE、ネイティブ共有対応
- 🌐 **オフライン対応**: ネット接続なしでも過去の月歌を閲覧
- 📱 **モバイル最適化**: スマートフォンでの快適な操作

## 🏗️ アーキテクチャ

React WebアプリをMVCパターンで構成し、PWA機能を追加：

### Model層
- `src/models/TsukiutaModel.js` - データ管理とAPI操作
  - LocalStorage による設定永続化
  - Supabase データベース操作
  - Claude API 呼び出し
  - オフライン月歌保存機能

### View層（Webコンポーネント）
- `src/components/web/Header.js` - アプリヘッダー（イベント案内付き）
- `src/components/web/ConfigSection.js` - 設定UI
- `src/components/web/FeelingSelector.js` - 感想選択フォーム
- `src/components/web/TsukiutaDisplay.js` - 月歌表示（アニメーション付き）
- `src/components/web/TsukiutaHistory.js` - 履歴表示
- `src/components/web/ShareSection.js` - **共有機能**（QRコード、SNS連携）

### Controller層
- `src/controllers/TsukiutaController.js` - ビジネスロジック（フックス形式）

### PWA機能
- `public/manifest.json` - アプリマニフェスト
- `public/sw.js` - Service Worker（キャッシュ機能）
- メタタグ最適化（Open Graph、Twitter Card対応）

## 🚀 イベント当日の使用方法

### 参加者向け手順

1. **URLアクセス**
   ```
   https://your-domain.com/tsukiuta
   ```

2. **感想選択**
   - 事前定義リストから最大3つ選択
   - または自由テキスト入力

3. **月歌生成**
   - 「月のかぐや姫へ送る」ボタンをタップ
   - Claude AIが5-7-5短詩を生成

4. **共有体験**
   - QRコードやURLで友達に共有
   - Twitter、LINEで月歌をシェア

### スタッフ向け設定

```bash
# 本番環境ビルド
npm run build

# 静的ファイル配信
npm run serve

# 環境変数設定（.env）
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-key
REACT_APP_CLAUDE_API_KEY=your-claude-key
```

## 📱 PWA（Progressive Web App）機能

### ホーム画面に追加
- iOS Safari: 共有ボタン → ホーム画面に追加
- Android Chrome: メニュー → ホーム画面に追加

### オフライン機能
- Service Workerによるキャッシュ
- ローカルストレージでの月歌保存
- ネットワーク接続なしでも閲覧可能

### ネイティブ風体験
- フルスクリーン表示
- スプラッシュスクリーン
- アプリアイコン表示

## 🎨 モバイルUX最適化

### タッチ操作最適化
- **大きなタップ領域**: ボタンサイズ44px以上
- **スワイプ対応**: スクロール領域の最適化
- **ズーム防止**: `user-scalable=no`設定

### パフォーマンス最適化
- **遅延ローディング**: 必要時のみ画像読み込み
- **キャッシュ活用**: Service Workerによる高速表示
- **軽量化**: TailwindCSSのCDN使用

### アクセシビリティ
- **カラーコントラスト**: WCAG準拠
- **フォントサイズ**: 読みやすい16px以上
- **タッチ対応**: 音声読み上げ対応

## 🔧 技術スタック

- **フロントエンド**: React 18 + TailwindCSS
- **状態管理**: カスタムフック（useTsukiutaController）
- **PWA**: Service Worker + Web App Manifest
- **QRコード**: qrcode.react
- **ルーティング**: React Router DOM
- **ホスティング**: 静的サイト配信（Vercel、Netlify推奨）

## 🔐 セキュリティ

- HTTPS必須（PWA要件）
- APIキーは環境変数で管理
- LocalStorageでの安全なデータ保存
- XSS対策（サニタイゼーション実装）

## 🌐 デプロイメント

### Vercel（推奨）
```bash
# Vercelにデプロイ
npm install -g vercel
vercel --prod

# 環境変数設定
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel env add REACT_APP_CLAUDE_API_KEY
```

### Netlify
```bash
# ビルド
npm run build

# build/フォルダをNetlifyにドラッグ&ドロップ
# 環境変数は管理画面で設定
```

## 📊 イベント分析

### 使用状況追跡
- 月歌生成数
- 共有回数
- 滞在時間
- デバイス種別

### Supabaseダッシュボード
- リアルタイム月歌データ
- 人気の感想ワード分析
- 時間別利用状況

## 🎪 イベント運営のポイント

### URL配布方法
- **QRコード**: ポスターやフライヤーに掲載
- **短縮URL**: 覚えやすいリンク（bit.ly等使用）
- **SNS投稿**: ハッシュタグと共に拡散

### サポート体制
- **簡単操作**: 3タップで月歌生成
- **ヘルプ表示**: 使い方ガイド内蔵
- **エラー対応**: 分かりやすいメッセージ

### 盛り上げ施策
- **リアルタイム表示**: 最新月歌の会場表示
- **共有促進**: SNSシェアでプレゼント企画
- **コレクション**: 複数月歌作成の奨励

## 🌙 月歌の特徴

- **5-7-5形式**: 厳密な音数カウント
- **季節感**: 金沢の秋、月見の美しさ
- **物語性**: 竹取物語の世界観
- **感情表現**: 幻想的で温かみのある詩

URLアクセスでスムーズな月歌体験を提供し、イベントを盛り上げます！🌙✨