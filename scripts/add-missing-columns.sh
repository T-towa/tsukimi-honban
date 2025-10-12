#!/bin/bash

# 不足しているカラムを追加するマイグレーションスクリプト

echo "🔧 Supabase テーブル修正スクリプト"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# .envファイルから環境変数を読み込み
if [ -f .env ]; then
    echo "✅ .envファイルを読み込み中..."
    source .env
else
    echo "❌ .envファイルが見つかりません"
    exit 1
fi

# 必要な環境変数の確認
if [ -z "$REACT_APP_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 必要な環境変数が設定されていません"
    echo "必要: REACT_APP_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "🔗 Supabase URL: $REACT_APP_SUPABASE_URL"
echo ""

# マイグレーションファイルの確認
MIGRATION_FILE="database/add_missing_columns.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ マイグレーションファイルが見つかりません: $MIGRATION_FILE"
    exit 1
fi

echo "📄 マイグレーションファイル: $MIGRATION_FILE"
echo ""

# 1. device_idカラムを追加
echo "1️⃣  device_id カラムを追加中..."
curl -s -X POST \
  "${REACT_APP_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE tsukiutas ADD COLUMN IF NOT EXISTS device_id TEXT;"
  }' || echo "⚠️  カラム追加: 既に存在する可能性があります"

echo ""

# 2. explanationカラムを追加
echo "2️⃣  explanation カラムを追加中..."
curl -s -X POST \
  "${REACT_APP_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE tsukiutas ADD COLUMN IF NOT EXISTS explanation TEXT;"
  }' || echo "⚠️  カラム追加: 既に存在する可能性があります"

echo ""

# 3. インデックスを追加
echo "3️⃣  device_id インデックスを追加中..."
curl -s -X POST \
  "${REACT_APP_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE INDEX IF NOT EXISTS idx_tsukiutas_device_id ON tsukiutas(device_id);"
  }' || echo "⚠️  インデックス追加: 既に存在する可能性があります"

echo ""
echo "✅ マイグレーション完了"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 確認用SQL（Supabase SQL Editorで実行）:"
echo ""
echo "-- カラムの存在確認"
echo "SELECT column_name, data_type, is_nullable, column_default"
echo "FROM information_schema.columns"
echo "WHERE table_name = 'tsukiutas'"
echo "ORDER BY ordinal_position;"
echo ""
echo "-- データ確認"
echo "SELECT id, device_id, explanation, tsukiuta, created_at"
echo "FROM tsukiutas"
echo "ORDER BY created_at DESC"
echo "LIMIT 5;"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
