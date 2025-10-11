#!/bin/bash

# Supabase マイグレーション実行スクリプト
# Unity送信フラグフィールドを追加

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Supabase マイグレーション実行"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 環境変数の読み込み
if [ -f .env ]; then
  source .env
else
  echo "❌ .env ファイルが見つかりません"
  exit 1
fi

# 必要な環境変数のチェック
if [ -z "$REACT_APP_SUPABASE_URL" ] || [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
  echo "❌ Supabase環境変数が設定されていません"
  echo "   REACT_APP_SUPABASE_URL と REACT_APP_SUPABASE_ANON_KEY が必要です"
  exit 1
fi

echo "📋 マイグレーションファイル: database/migration_add_unity_sent_flag.sql"
echo "🌐 Supabase URL: $REACT_APP_SUPABASE_URL"
echo ""

# マイグレーションSQLの読み込み
MIGRATION_FILE="database/migration_add_unity_sent_flag.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ マイグレーションファイルが見つかりません: $MIGRATION_FILE"
  exit 1
fi

echo "📖 マイグレーションSQL:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$MIGRATION_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# SQLを1行ずつ実行
echo "⚙️  マイグレーション実行中..."
echo ""

# コメント行と空行を除去してSQLを抽出
SQL_COMMANDS=$(grep -v "^--" "$MIGRATION_FILE" | grep -v "^$" | sed 's/;$//')

# ALTER TABLE コマンドを実行
echo "1️⃣  is_sent_to_unity カラムを追加中..."
curl -s -X POST \
  "${REACT_APP_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE tsukiutas ADD COLUMN IF NOT EXISTS is_sent_to_unity BOOLEAN DEFAULT false;"
  }' || echo "⚠️  カラム追加: 既に存在する可能性があります"

echo ""
echo "2️⃣  sent_to_unity_at カラムを追加中..."
curl -s -X POST \
  "${REACT_APP_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ALTER TABLE tsukiutas ADD COLUMN IF NOT EXISTS sent_to_unity_at TIMESTAMPTZ;"
  }' || echo "⚠️  カラム追加: 既に存在する可能性があります"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 マイグレーション結果確認"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "以下のSQLをSupabase SQL Editorで実行して確認してください："
echo ""
echo "-- カラムの存在確認"
echo "SELECT column_name, data_type, is_nullable, column_default"
echo "FROM information_schema.columns"
echo "WHERE table_name = 'tsukiutas'"
echo "AND column_name IN ('is_sent_to_unity', 'sent_to_unity_at');"
echo ""
echo "-- データ確認"
echo "SELECT id, tsukiuta, is_sent_to_unity, sent_to_unity_at, created_at"
echo "FROM tsukiutas"
echo "ORDER BY created_at DESC"
echo "LIMIT 5;"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ マイグレーションスクリプト完了"
echo ""
echo "⚠️  注意: Supabase REST APIでは一部のDDL操作が制限されています。"
echo "    完全なマイグレーションは Supabase Dashboard の SQL Editor で"
echo "    直接実行することを推奨します。"
echo ""
echo "📍 Supabase Dashboard:"
echo "   ${REACT_APP_SUPABASE_URL}/project/_/sql"
echo ""
