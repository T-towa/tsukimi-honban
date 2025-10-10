-- 月歌データベース内のreadingフィールドの不正文字列を修正するSQL
-- 実行前にバックアップを取ることを推奨

-- 不正な文字列を含むレコードを確認
SELECT id, reading, tsukiuta 
FROM tsukiutas 
WHERE reading ~ '[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000\s]'
ORDER BY id;

-- readingフィールドから不正な文字を除去
UPDATE tsukiutas 
SET reading = REGEXP_REPLACE(reading, '[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000\s]', '', 'g'),
    updated_at = NOW()
WHERE reading ~ '[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000\s]';

-- 修正後の確認
SELECT id, reading, tsukiuta 
FROM tsukiutas 
WHERE updated_at > NOW() - INTERVAL '1 minute'
ORDER BY id;

-- 統計情報
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN reading IS NOT NULL AND reading != '' THEN 1 END) as records_with_reading,
  COUNT(CASE WHEN reading ~ '[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000\s]' THEN 1 END) as records_with_invalid_chars
FROM tsukiutas;


