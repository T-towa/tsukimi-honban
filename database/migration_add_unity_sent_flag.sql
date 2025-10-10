-- Migration: Add Unity送信フラグをtsukiutasテーブルに追加
-- 実行日: 2025-10-08
-- 目的: Unity側へのプロジェクションマッピング送信管理

-- 1. is_sent_to_unityカラムを追加 (デフォルト: false)
ALTER TABLE tsukiutas
ADD COLUMN IF NOT EXISTS is_sent_to_unity BOOLEAN DEFAULT false;

-- 2. sent_to_unity_atカラムを追加 (Unity送信日時)
ALTER TABLE tsukiutas
ADD COLUMN IF NOT EXISTS sent_to_unity_at TIMESTAMPTZ;

-- 3. インデックス追加（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_tsukiutas_pending_unity
ON tsukiutas(is_sent_to_unity, created_at)
WHERE is_sent_to_unity = false;

-- 4. コメント追加
COMMENT ON COLUMN tsukiutas.is_sent_to_unity IS 'Unity側に送信済みかどうか';
COMMENT ON COLUMN tsukiutas.sent_to_unity_at IS 'Unity側に送信した日時';

-- 確認用クエリ
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'tsukiutas'
-- AND column_name IN ('is_sent_to_unity', 'sent_to_unity_at');
