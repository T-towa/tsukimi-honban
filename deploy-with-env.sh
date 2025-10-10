#!/bin/bash

# Supabase環境変数をGCloud Runに設定してデプロイ

# .envファイルから環境変数を読み込み
if [ ! -f .env ]; then
  echo "❌ .envファイルが見つかりません"
  exit 1
fi

# 環境変数を抽出
SUPABASE_URL=$(grep REACT_APP_SUPABASE_URL .env | cut -d '=' -f2)
SUPABASE_KEY=$(grep REACT_APP_SUPABASE_ANON_KEY .env | cut -d '=' -f2)
CLAUDE_API_KEY=$(grep CLAUDE_API_KEY .env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ .envファイルにSupabase設定がありません"
  exit 1
fi

echo "🚀 GCloud Runにデプロイ中..."
echo "📍 Region: asia-northeast1"
echo "🔧 環境変数を設定..."

# GCloud Runサービスを更新（環境変数のみ）
gcloud run services update honban \
  --region=asia-northeast1 \
  --set-env-vars "REACT_APP_SUPABASE_URL=${SUPABASE_URL},REACT_APP_SUPABASE_ANON_KEY=${SUPABASE_KEY},CLAUDE_API_KEY=${CLAUDE_API_KEY}"

if [ $? -eq 0 ]; then
  echo "✅ 環境変数の設定が完了しました"

  # サービスURLを取得
  SERVICE_URL=$(gcloud run services describe honban --region=asia-northeast1 --format="value(status.url)")
  echo "🌐 サービスURL: ${SERVICE_URL}"
  echo ""
  echo "🧪 Unity APIテスト:"
  echo "curl ${SERVICE_URL}/api/get-pending-tsukiutas"
else
  echo "❌ デプロイに失敗しました"
  exit 1
fi
