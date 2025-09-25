-- 月歌データベースセットアップ SQL (シンプル版)
-- Supabase PostgreSQL用 - 最小構成

-- tsukiutasテーブル作成
CREATE TABLE IF NOT EXISTS tsukiutas (
  id SERIAL PRIMARY KEY,                    -- 自動採番ID (1, 2, 3...)
  impression TEXT NOT NULL,                 -- 感想（カンマ区切り）
  tsukiuta TEXT NOT NULL,                   -- 完成した月歌
  line1 TEXT NOT NULL,                      -- 5音の句
  line2 TEXT NOT NULL,                      -- 7音の句
  line3 TEXT NOT NULL,                      -- 5音の句
  syllables_line1 INTEGER DEFAULT 5,       -- 1行目音数
  syllables_line2 INTEGER DEFAULT 7,       -- 2行目音数
  syllables_line3 INTEGER DEFAULT 5,       -- 3行目音数
  reading TEXT,                             -- ひらがな読み
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 作成日時
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()   -- 更新日時
);

-- 基本インデックス作成
CREATE INDEX IF NOT EXISTS idx_tsukiutas_created_at ON tsukiutas(created_at DESC);

-- Row Level Security (RLS) 設定
ALTER TABLE tsukiutas ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "公開読み取り" ON tsukiutas
  FOR SELECT USING (true);

-- 全ユーザーが挿入可能
CREATE POLICY "公開挿入" ON tsukiutas
  FOR INSERT WITH CHECK (true);

-- サンプルデータ挿入（テスト用）
INSERT INTO tsukiutas (
  impression,
  tsukiuta,
  line1,
  line2,
  line3,
  syllables_line1,
  syllables_line2,
  syllables_line3,
  reading
) VALUES (
  '美しい、幻想的、感動',
  '月見れば かぐや姫さま 微笑みて',
  '月見れば',
  'かぐや姫さま',
  '微笑みて',
  5,
  7,
  5,
  'つきみれば かぐやひめさま ほほえみて'
) ON CONFLICT DO NOTHING;