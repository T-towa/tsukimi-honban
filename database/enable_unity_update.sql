-- Unity API用のUPDATE権限を有効化するSQL
-- 実行方法: Supabase SQL Editor で実行

-- 1. 既存のRLSポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tsukiutas';

-- 2. Unity API用のUPDATE権限を追加
-- 匿名ユーザーがis_sent_to_unityフィールドのみ更新可能にする
CREATE POLICY "Allow Unity API to update sent flag" ON tsukiutas
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

-- 3. または、より制限的なポリシー（推奨）
-- DROP POLICY IF EXISTS "Allow Unity API to update sent flag" ON tsukiutas;
-- CREATE POLICY "Allow Unity API to update sent flag" ON tsukiutas
--     FOR UPDATE 
--     TO anon
--     USING (is_sent_to_unity = false)  -- 未送信のもののみ
--     WITH CHECK (is_sent_to_unity = true);  -- trueに更新のみ許可

-- 4. 確認用クエリ
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tsukiutas' AND policyname LIKE '%Unity%';
