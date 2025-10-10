# 月歌ポーリングシステム - Unity実装ガイド

プロジェクションマッピング用の月歌自動取得システムです。

## 📋 概要

WebアプリからプロジェクションマッピングUnity側に月歌データを自動配信するシステムです。
Unity側は5秒間隔でAPIをポーリングし、新しい月歌を自動的に受信・表示します。

## 🎯 システムフロー

```
[Webアプリユーザー]
    ↓ 月歌生成
    ↓ 「月歌を月に届ける」ボタンクリック
    ↓
[Supabase] is_sent_to_unity = false で保存
    ↓
[Unity側] 5秒ごとにポーリング
    ↓
[API] /api/get-pending-tsukiutas
    ↓ 未送信月歌を返す & is_sent_to_unity = true に更新
    ↓
[Unity] プロジェクションマッピングで表示
```

## 📦 必要なファイル

### 1. TsukiutaPoller.cs
月歌データをAPIからポーリングで取得するコンポーネント

**主な機能:**
- 5秒間隔でAPIポーリング（カスタマイズ可能）
- 自動的に新しい月歌を検出
- イベントシステムで他のコンポーネントに通知
- 統計情報の取得

### 2. ProjectionMappingController.cs
受信した月歌をプロジェクションマッピングで表示するコンポーネント

**主な機能:**
- 月歌の自動表示
- フェードイン/フェードアウトアニメーション
- エフェクト・オーディオ連携
- 表示キュー管理（実装可能）

## 🚀 セットアップ手順

### 1. スクリプトの配置

```
Assets/
  Scripts/
    Tsukiuta/
      TsukiutaPoller.cs
      ProjectionMappingController.cs
```

### 2. シーンへの追加

#### A. TsukiutaPoller の設定

1. 空のGameObjectを作成: `TsukiutaPoller`
2. `TsukiutaPoller.cs` をアタッチ
3. Inspectorで設定:
   - **API Base Url**: `https://your-app.com`
   - **Poll Interval**: `5` （秒）
   - **Enable Debug Log**: `true` （開発中）

#### B. ProjectionMappingController の設定

1. 新しいGameObjectを作成: `ProjectionMapping`
2. `ProjectionMappingController.cs` をアタッチ
3. UI要素を作成:
   - Canvas
   - TextMeshPro要素（月歌表示用）
   - パーティクルシステム（オプション）
   - AudioSource（オプション）

4. Inspectorで設定:
   - **Tsukiuta Full Text**: 月歌全体表示用TextMeshPro
   - **Line1/2/3 Text**: 各行表示用TextMeshPro
   - **Reading Text**: 読み仮名表示用
   - **Explanation Text**: 説明表示用
   - **Poller**: TsukiutaPollerコンポーネント
   - **Display Effect**: パーティクルエフェクト
   - **Display Audio**: オーディオソース

### 3. 実行

Playモードで起動すると、自動的にポーリングが開始されます。

## 📝 API仕様

### エンドポイント
```
GET /api/get-pending-tsukiutas
```

### レスポンス例
```json
{
  "success": true,
  "count": 2,
  "message": "2 tsukiutas sent to Unity",
  "tsukiutas": [
    {
      "id": 123,
      "impression": "美しい月明かり、幻想的な光",
      "tsukiuta": "月光の 竹に響きて 夜更けかな",
      "line1": "月光の",
      "line2": "竹に響きて",
      "line3": "夜更けかな",
      "syllables_line1": 5,
      "syllables_line2": 7,
      "syllables_line3": 5,
      "reading": "げっこうの たけにひびきて よふけかな",
      "explanation": "月の光が竹林に響く静寂な夜更けの情景を詠んだ句",
      "created_at": "2025-10-08T12:34:56.789Z",
      "is_sent_to_unity": false,
      "sent_to_unity_at": null
    }
  ]
}
```

## 💡 カスタマイズ例

### ポーリング間隔を変更

```csharp
TsukiutaPoller poller = GetComponent<TsukiutaPoller>();
poller.SetPollInterval(10f); // 10秒に変更
```

### 手動ポーリング実行

```csharp
TsukiutaPoller poller = GetComponent<TsukiutaPoller>();
poller.PollNow(); // 即座にポーリング
```

### カスタム表示処理

```csharp
public class CustomDisplayController : MonoBehaviour
{
    public TsukiutaPoller poller;

    void Start()
    {
        // イベントに独自の処理を登録
        poller.onTsukiutaReceived.AddListener(OnCustomTsukiutaReceived);
    }

    private void OnCustomTsukiutaReceived(TsukiutaData tsukiuta)
    {
        // 独自の表示処理
        Debug.Log($"Custom display: {tsukiuta.tsukiuta}");

        // 3Dオブジェクトに表示
        // パーティクルエフェクト
        // サウンド再生
        // など
    }
}
```

### ポイント数に応じた装飾変更

```csharp
public class DecorationController : MonoBehaviour
{
    public TsukiutaPoller poller;
    public ParticleSystem[] decorationLevels; // 0-5ポイント用のエフェクト

    void Start()
    {
        poller.onTsukiutaReceived.AddListener(OnTsukiutaReceived);
    }

    private void OnTsukiutaReceived(TsukiutaData tsukiuta)
    {
        // ポイント情報は別途device_idから取得する必要あり
        // ここでは月歌データのみ受信

        // TODO: ポイント情報が必要な場合は別APIで取得
        // GET /api/get-player-points?device_id=xxx

        // 装飾レベルに応じたエフェクト表示
        // decorationLevels[points].Play();
    }
}
```

## 🔧 トラブルシューティング

### 月歌が受信できない

1. **API URLの確認**
   ```csharp
   Debug.Log(poller.apiBaseUrl);
   ```

2. **ネットワーク接続確認**
   - Unityエディタのコンソールでエラーを確認
   - ブラウザで直接APIを叩いてテスト

3. **Supabaseデータ確認**
   ```sql
   SELECT * FROM tsukiutas
   WHERE is_sent_to_unity = false
   ORDER BY created_at DESC;
   ```

### ポーリングが動作しない

1. **ポーラーの状態確認**
   ```csharp
   PollerStats stats = poller.GetStats();
   Debug.Log($"Polling: {stats.isPolling}");
   Debug.Log($"Interval: {stats.pollInterval}");
   Debug.Log($"Total: {stats.totalReceived}");
   ```

2. **イベント登録確認**
   ```csharp
   // ProjectionMappingControllerがアタッチされているか確認
   ```

### 表示が正しくない

1. **UI要素の確認**
   - TextMeshProコンポーネントが設定されているか
   - Canvas設定が正しいか

2. **アニメーション設定**
   - fadeInDuration, displayDuration, fadeOutDurationの値を確認

## 📊 統計情報の取得

```csharp
PollerStats stats = poller.GetStats();

Debug.Log($"Is Polling: {stats.isPolling}");
Debug.Log($"Poll Interval: {stats.pollInterval}s");
Debug.Log($"Total Received: {stats.totalReceived}");
Debug.Log($"Last Poll: {stats.lastPollTime}");
Debug.Log($"Last Success: {stats.lastSuccessTime}");
```

## 🎨 表示例

### シンプルな表示

```
┌──────────────────────┐
│                      │
│      月光の          │
│    竹に響きて        │
│     夜更けかな       │
│                      │
│ げっこうの たけに   │
│ ひびきて よふけかな  │
└──────────────────────┘
```

### リッチな表示

```
    ✨ ✨ ✨
  🌙  月光の  🌙
     竹に響きて
    夜更けかな
  ✨ ✨ ✨

  + パーティクルエフェクト
  + 環境音
  + プロジェクションマッピング
```

## 📞 サポート

実装に関する質問や問題がある場合は、プロジェクトのIssueページでお知らせください。

---

**月見光路プロジェクト - Unity プロジェクションマッピングシステム**
