#!/bin/bash

# Cloud RunにSUPABASE_SERVICE_ROLE_KEY環境変数を設定するスクリプト

echo "🔑 Supabase Service Role Key 設定スクリプト"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 環境変数の確認
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY環境変数が設定されていません"
    echo ""
    echo "📋 設定手順:"
    echo "1. Supabaseダッシュボード → Settings → API → Project API keys"
    echo "2. 'service_role' キーをコピー"
    echo "3. 以下のコマンドを実行:"
    echo ""
    echo "export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key-here'"
    echo "./scripts/setup-service-role-key.sh"
    echo ""
    exit 1
fi

echo "✅ SUPABASE_SERVICE_ROLE_KEY が設定されています"
echo ""

# Cloud Runサービスに環境変数を設定
echo "🚀 Cloud Run サービスに環境変数を設定中..."

gcloud run services update tsukiuta-web \
    --region=asia-northeast1 \
    --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" \
    --quiet

if [ $? -eq 0 ]; then
    echo "✅ 環境変数の設定が完了しました"
    echo ""
    echo "🧪 テスト実行:"
    echo "curl -s 'https://tsukiuta-web-tyzx4tqwua-an.a.run.app/api/get-pending-tsukiutas' | jq '.'"
    echo ""
    echo "📊 ログ確認:"
    echo "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=tsukiuta-web\" --limit=5"
else
    echo "❌ 環境変数の設定に失敗しました"
    exit 1
fi
