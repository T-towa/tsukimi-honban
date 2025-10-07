#!/bin/bash
# Google Cloud Run デプロイスクリプト（環境変数付き）

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 月歌Web - Google Cloud Run デプロイ開始${NC}"

# 環境変数の確認
if [ -f .env ]; then
    echo -e "${GREEN}✅ .envファイルが見つかりました${NC}"
    source .env
else
    echo -e "${RED}❌ .envファイルが見つかりません${NC}"
    exit 1
fi

# 必要な環境変数の確認
if [ -z "$REACT_APP_SUPABASE_URL" ] || [ -z "$REACT_APP_SUPABASE_ANON_KEY" ] || [ -z "$CLAUDE_API_KEY" ]; then
    echo -e "${RED}❌ 必要な環境変数が設定されていません${NC}"
    echo "必要な変数: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, CLAUDE_API_KEY"
    exit 1
fi

# Google Cloud プロジェクトIDの取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Google Cloud プロジェクトが設定されていません${NC}"
    echo "実行: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}📦 プロジェクトID: ${PROJECT_ID}${NC}"

# Cloud Build実行（環境変数を変数として渡す）
echo -e "${YELLOW}🔨 Cloud Buildを実行中...${NC}"

gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=\
_SUPABASE_URL="${REACT_APP_SUPABASE_URL}",\
_SUPABASE_ANON_KEY="${REACT_APP_SUPABASE_ANON_KEY}",\
_CLAUDE_API_KEY="${CLAUDE_API_KEY}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ デプロイ成功！${NC}"
    echo ""
    echo -e "${GREEN}🌐 アプリケーションURL:${NC}"
    gcloud run services describe tsukiuta-web --region=asia-northeast1 --format='value(status.url)'
else
    echo -e "${RED}❌ デプロイ失敗${NC}"
    exit 1
fi
