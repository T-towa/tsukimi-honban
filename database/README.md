# 🗃️ データベースセットアップガイド

## Supabaseでのテーブル作成手順

### 1. Supabaseプロジェクト作成
1. [Supabase](https://supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

### 2. SQLエディタでテーブル作成

**推奨**: シンプル版を使用
1. ダッシュボードの「SQL Editor」を開く
2. `database/setup-simple.sql` の内容をコピー&ペースト
3. 「RUN」ボタンで実行

**エラーが出た場合**:
- 日本語検索エラー (`text search configuration "japanese" does not exist`) が出た場合は `setup-simple.sql` を使用
- 完全版 (`setup.sql`) は高度な機能が含まれているため、環境によってはエラーになる場合があります

### 3. 環境変数設定
`.env` ファイルに以下を設定：

```env
# Supabase設定
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Claude API設定
REACT_APP_CLAUDE_API_KEY=your-claude-api-key

# その他設定
REACT_APP_HISTORY_LIMIT=10
REACT_APP_MAX_FEELINGS=3
REACT_APP_CUSTOM_FEELING_MAX_LENGTH=50
```

## 📊 テーブル構造

### tsukiutas テーブル

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| `id` | SERIAL PRIMARY KEY | **自動採番ID** (1, 2, 3...) |
| `impression` | TEXT | 感想（カンマ区切り） |
| `tsukiuta` | TEXT | 完成した月歌 |
| `line1` | TEXT | 5音の句 |
| `line2` | TEXT | 7音の句 |
| `line3` | TEXT | 5音の句 |
| `syllables_line1` | INTEGER | 1行目音数（デフォルト: 5） |
| `syllables_line2` | INTEGER | 2行目音数（デフォルト: 7） |
| `syllables_line3` | INTEGER | 3行目音数（デフォルト: 5） |
| `reading` | TEXT | ひらがな読み |
| `created_at` | TIMESTAMP | 作成日時（自動設定） |
| `updated_at` | TIMESTAMP | 更新日時（自動更新） |

## 🔧 特徴

### 自動採番システム
- **ID**: PostgreSQLの`SERIAL`型で1から順番に自動採番
- **作成日時**: `NOW()`関数で自動設定
- **更新日時**: トリガーで自動更新

### セキュリティ設定
- **Row Level Security**: 有効化済み
- **読み取り権限**: 全ユーザー公開
- **書き込み権限**: 全ユーザー許可

### パフォーマンス最適化
- **インデックス**: 作成日時の降順、感想テキスト検索用
- **統計情報**: 自動更新設定

## 🧪 テストデータ

セットアップ時にサンプル月歌が1件挿入されます：

```
ID: 1
感想: 美しい、幻想的、感動
月歌: 月見れば かぐや姫さま 微笑みて
読み: つきみれば かぐやひめさま ほほえみて
```

## 📝 使用例

### データ挿入例
```sql
INSERT INTO tsukiutas (
  impression, tsukiuta, line1, line2, line3,
  syllables_line1, syllables_line2, syllables_line3,
  reading
) VALUES (
  '静寂、美しい、感動的',
  '静寂なり 月光さして 心澄む',
  '静寂なり',
  '月光さして',
  '心澄む',
  5, 7, 5,
  'せいじゃくなり げっこうさして こころすむ'
);
```

### データ取得例
```sql
-- 最新10件取得
SELECT * FROM tsukiutas ORDER BY created_at DESC LIMIT 10;

-- 特定の感想で検索
SELECT * FROM tsukiutas
WHERE impression LIKE '%美しい%'
ORDER BY created_at DESC;

-- 統計情報
SELECT COUNT(*) as total_tsukiutas FROM tsukiutas;
```

## ⚡ 自動機能

### 1. ID自動採番
- 新しい月歌が作成されるたびに、自動的に1, 2, 3...とIDが割り当てられます
- アプリケーション側でIDを指定する必要はありません

### 2. タイムスタンプ自動管理
- `created_at`: レコード作成時に自動設定
- `updated_at`: レコード更新時に自動更新

### 3. データ整合性保証
- 必須フィールドのNOT NULL制約
- 適切なデータ型制約
- インデックスによる高速検索

これで自動採番対応のデータベースが完成します！🎯