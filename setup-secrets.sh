#!/bin/bash

# このスクリプトを実行してSecret Managerに秘密情報を保存します
# 使用方法: ./setup-secrets.sh

echo "Google Cloud Secret Managerのセットアップ"
echo "========================================="

# プロジェクトIDの確認
PROJECT_ID=$(gcloud config get-value project)
echo "プロジェクトID: $PROJECT_ID"

# Secret Manager APIを有効化
echo "Secret Manager APIを有効化中..."
gcloud services enable secretmanager.googleapis.com

# Claude API キーの作成
echo "Claude API キーを入力してください:"
read -s CLAUDE_KEY
echo "$CLAUDE_KEY" | gcloud secrets create claude-api-key \
    --data-file=- \
    --replication-policy="automatic" \
    2>/dev/null || echo "$CLAUDE_KEY" | gcloud secrets versions add claude-api-key --data-file=-

# Supabase URLの作成
echo "Supabase URLを入力してください:"
read SUPABASE_URL
echo "$SUPABASE_URL" | gcloud secrets create supabase-url \
    --data-file=- \
    --replication-policy="automatic" \
    2>/dev/null || echo "$SUPABASE_URL" | gcloud secrets versions add supabase-url --data-file=-

# Supabase Anon Keyの作成
echo "Supabase Anon Keyを入力してください:"
read -s SUPABASE_KEY
echo "$SUPABASE_KEY" | gcloud secrets create supabase-anon-key \
    --data-file=- \
    --replication-policy="automatic" \
    2>/dev/null || echo "$SUPABASE_KEY" | gcloud secrets versions add supabase-anon-key --data-file=-

# Cloud BuildサービスアカウントにSecret Managerへのアクセス権限を付与
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding claude-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-url \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding supabase-anon-key \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

echo "========================================="
echo "セットアップ完了！"
echo ""
echo "以下のコマンドでデプロイできます："
echo "gcloud builds submit --config cloudbuild-with-secrets.yaml"