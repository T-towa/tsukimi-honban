#!/bin/bash

# フルデプロイスクリプト（ビルド + デプロイ）

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 フルデプロイ開始"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# 環境変数の読み込み
if [ -f .env ]; then
  echo "📋 環境変数を読み込み中..."
  source .env
else
  echo "❌ .env ファイルが見つかりません"
  exit 1
fi

# 1. Reactアプリのビルド
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1: Reactアプリをビルド"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run build

if [ $? -ne 0 ]; then
  echo "❌ ビルドに失敗しました"
  exit 1
fi

echo "✅ ビルド完了"

# 2. Google Cloud Runにデプロイ
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "☁️  Step 2: Google Cloud Runにデプロイ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# GCPプロジェクトとリージョン設定
GCP_PROJECT_ID="tsukiuta"
GCP_REGION="asia-northeast1"
SERVICE_NAME="honban"

echo "📍 プロジェクト: $GCP_PROJECT_ID"
echo "📍 リージョン: $GCP_REGION"
echo "📍 サービス名: $SERVICE_NAME"
echo ""

# gcloud設定
gcloud config set project $GCP_PROJECT_ID

# Cloud Buildでビルド&デプロイ
echo "🔨 Cloud Buildを実行中..."
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_SUPABASE_URL="$REACT_APP_SUPABASE_URL",_SUPABASE_ANON_KEY="$REACT_APP_SUPABASE_ANON_KEY",_CLAUDE_API_KEY="$CLAUDE_API_KEY"

if [ $? -ne 0 ]; then
  echo "❌ デプロイに失敗しました"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ デプロイ完了"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# サービスURLを取得
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$GCP_REGION --format="value(status.url)")

echo "🌐 サービスURL: $SERVICE_URL"
echo ""

# 3. Unity API動作確認
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Step 3: Unity API動作確認"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📡 Unity APIをテスト中..."
RESPONSE=$(curl -s -w "\n%{http_code}" "${SERVICE_URL}/api/get-pending-tsukiutas")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Unity API正常動作"
  echo ""
  echo "📄 レスポンス:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "⚠️  Unity API応答エラー"
  echo "$BODY"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 全工程完了"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 アクセスURL:"
echo "   メインアプリ: $SERVICE_URL"
echo "   Unity API: $SERVICE_URL/api/get-pending-tsukiutas"
echo "   体験ページ: $SERVICE_URL/challenges"
echo ""
