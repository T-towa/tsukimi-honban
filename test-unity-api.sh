#!/bin/bash

# Unity API テストスクリプト

# GCloud Run サービスURLを取得
SERVICE_URL=$(gcloud run services describe honban --region=asia-northeast1 --format="value(status.url)")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Unity API テスト"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 サービスURL: ${SERVICE_URL}"
echo ""

# 1. Unity API を呼び出し
echo "📡 Unity APIを呼び出し中..."
echo "GET ${SERVICE_URL}/api/get-pending-tsukiutas"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" "${SERVICE_URL}/api/get-pending-tsukiutas")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: ${HTTP_CODE}"
echo ""
echo "📄 レスポンス:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# 2. Supabaseのデータを確認するためのSQL表示
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Supabaseでデータ確認"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "以下のSQLをSupabase SQL Editorで実行してください："
echo ""
echo "-- 未送信の月歌を確認"
echo "SELECT id, tsukiuta, is_sent_to_unity, created_at"
echo "FROM tsukiutas"
echo "WHERE is_sent_to_unity = false"
echo "ORDER BY created_at DESC"
echo "LIMIT 10;"
echo ""
echo "-- 最近送信された月歌を確認"
echo "SELECT id, tsukiuta, is_sent_to_unity, sent_to_unity_at"
echo "FROM tsukiutas"
echo "WHERE is_sent_to_unity = true"
echo "ORDER BY sent_to_unity_at DESC"
echo "LIMIT 5;"
echo ""

# 3. レスポンス解析
COUNT=$(echo "$BODY" | jq -r '.count' 2>/dev/null)
SUCCESS=$(echo "$BODY" | jq -r '.success' 2>/dev/null)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 診断結果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ HTTP Status: OK"
else
  echo "❌ HTTP Status: ${HTTP_CODE}"
fi

if [ "$SUCCESS" = "true" ]; then
  echo "✅ API Success: true"
else
  echo "❌ API Success: ${SUCCESS}"
fi

if [ "$COUNT" = "0" ]; then
  echo "⚠️  未送信の月歌: 0件"
  echo ""
  echo "💡 対処法:"
  echo "  1. Webアプリで月歌を生成"
  echo "  2. 「🌙 月歌を月に届ける」ボタンをクリック"
  echo "  3. もう一度このスクリプトを実行"
elif [ "$COUNT" != "null" ] && [ -n "$COUNT" ]; then
  echo "✅ 未送信の月歌: ${COUNT}件"
  echo ""
  echo "🎉 Unity側でこのデータを受信できるはずです！"
else
  echo "❌ データカウント取得失敗"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Unity側の確認ポイント:"
echo "  1. Unity Console で [TsukiutaPoller] ログを確認"
echo "  2. apiBaseUrl = \"${SERVICE_URL}\" (末尾スラッシュなし)"
echo "  3. enableDebugLog = true に設定"
echo ""
