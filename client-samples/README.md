# 月歌WebSocketクライアント実装ガイド

このディレクトリには、月歌システム用WebSocketクライアントの実装サンプルが含まれています。

## 📋 概要

月歌システムでは、新しい月歌が生成されたときにWebSocket経由でリアルタイムに通知を送信します。
このガイドでは、様々なプラットフォーム向けのクライアント実装方法を説明します。

## 🔧 サーバー仕様

### WebSocket接続
- **エンドポイント**: `ws://localhost:3002/unity`
- **プロトコル**: WebSocket
- **データ形式**: JSON

### メッセージタイプ

#### 1. 接続確認（サーバー → クライアント）
```json
{
  "type": "CONNECTION_CONFIRMED",
  "message": "月歌システムに接続されました",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 2. 新しい月歌通知（サーバー → クライアント）
```json
{
  "type": "NEW_TSUKIUTA",
  "data": {
    "impression": "美しい月明かり、幻想的な光",
    "tsukiuta": "月光の 竹に響きて 夜更けかな",
    "line1": "月光の",
    "line2": "竹に響きて",
    "line3": "夜更けかな",
    "syllables_line1": 5,
    "syllables_line2": 7,
    "syllables_line3": 5,
    "reading": "げっこうの たけにひびきて よふけかな",
    "explanation": "月の光が竹林に響く静寂な夜更けの情景を詠んだ句"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 3. Ping/Pong（クライアント ⇄ サーバー）
```json
// クライアント → サーバー
{
  "type": "PING",
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// サーバー → クライアント
{
  "type": "PONG",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 📁 実装サンプル

### 1. Unity C# クライアント
**ファイル**: `Unity/TsukiutaWebSocketClient.cs`

Unity向けのWebSocketクライアント実装です。

#### 必要なパッケージ
```
- WebSocketSharp (NuGet)
- Newtonsoft.Json (Unity Package Manager)
```

#### 基本的な使い方
```csharp
public class TsukiutaReceiver : MonoBehaviour
{
    private TsukiutaWebSocketClient client;

    void Start()
    {
        client = GetComponent<TsukiutaWebSocketClient>();
        
        // イベントリスナー設定
        client.OnTsukiutaReceived += HandleNewTsukiuta;
        client.OnConnected += () => Debug.Log("接続しました");
        client.OnDisconnected += () => Debug.Log("切断されました");
    }

    void HandleNewTsukiuta(TsukiutaData data)
    {
        Debug.Log($"新しい月歌: {data.tsukiuta}");
        // UIに表示する処理
        DisplayTsukiuta(data);
    }
}
```

### 2. JavaScript/Web クライアント
**ファイル**: `JavaScript/tsukiuta-websocket-client.js`

ブラウザ環境向けのWebSocketクライアント実装です。

#### 基本的な使い方
```javascript
// クライアント作成
const client = new TsukiutaWebSocketClient({
    serverUrl: 'ws://localhost:3002/unity'
});

// イベントリスナー設定
client.on('tsukiutaReceived', (tsukiutaData) => {
    console.log('新しい月歌:', tsukiutaData.tsukiuta);
    displayTsukiuta(tsukiutaData);
});

// 接続
await client.connect();
```

#### デモページ
**ファイル**: `JavaScript/demo.html`

実際にブラウザで動作するデモページです。そのまま開いて動作を確認できます。

### 3. Python クライアント
**ファイル**: `Python/tsukiuta_websocket_client.py`

Python環境向けのWebSocketクライアント実装です。

#### 必要なパッケージ
```bash
pip install websockets
```

#### 基本的な使い方
```python
import asyncio
from tsukiuta_websocket_client import TsukiutaWebSocketClient

async def main():
    client = TsukiutaWebSocketClient()
    
    # イベントハンドラ設定
    def on_tsukiuta(data):
        print(f"新しい月歌: {data['tsukiuta']}")
    
    client.on('tsukiuta_received', on_tsukiuta)
    
    # 接続・待機
    await client.connect()
    while client.connected:
        await asyncio.sleep(1)

# 実行
asyncio.run(main())
```

## 🚀 セットアップ手順

### 1. サーバー起動
```bash
# プロジェクトルートで
node unity-websocket-server.js
```

### 2. 各クライアントのテスト

#### Unity
1. Unity projectを開く
2. `TsukiutaWebSocketClient.cs`をGameObjectにアタッチ
3. サーバーURLを設定
4. Play mode で実行

#### JavaScript
1. `JavaScript/demo.html`をブラウザで開く
2. 「接続」ボタンをクリック
3. 月歌生成アプリから月歌を送信してテスト

#### Python
```bash
cd client-samples/Python
python tsukiuta_websocket_client.py
```

## 📡 実装のポイント

### 接続管理
- **自動再接続**: 接続が切れた場合の自動再接続機能
- **指数バックオフ**: 再接続間隔を徐々に延長
- **最大試行回数**: 無限ループを防ぐための制限

### エラーハンドリング
- **JSON解析エラー**: 不正なメッセージフォーマットへの対応
- **接続エラー**: ネットワーク障害への対応
- **タイムアウト**: 応答がない場合の処理

### パフォーマンス
- **Ping/Pong**: 接続状態の監視
- **非同期処理**: UIブロックの防止
- **リソース管理**: メモリリークの防止

## 🔧 カスタマイズ

各クライアントは以下の設定をカスタマイズできます：

```
- serverUrl: WebSocketサーバーのURL
- pingInterval: Ping送信間隔（秒）
- reconnectDelay: 再接続待機時間（秒）
- maxReconnectAttempts: 最大再接続試行回数
- enableDebugLog: デバッグログの有効/無効
```

## 📝 注意事項

1. **CORS設定**: Web環境では適切なCORS設定が必要
2. **ファイアウォール**: ポート3002が開放されていることを確認
3. **WebSocket対応**: 古いブラウザではWebSocketが利用できない場合があります
4. **SSL/TLS**: 本番環境では`wss://`の使用を推奨

## 🐛 トラブルシューティング

### 接続できない場合
1. サーバーが起動しているか確認
2. ポート3002が使用可能か確認
3. ファイアウォール設定を確認

### メッセージが受信できない場合
1. 接続状態を確認
2. コンソールログでエラーメッセージを確認
3. サーバーログを確認

### パフォーマンスの問題
1. Ping間隔を調整
2. 不要なログ出力を無効化
3. メモリ使用量を監視

## 📞 サポート

実装に関する質問や問題がある場合は、プロジェクトのIssueページでお知らせください。

---

*このガイドは月歌プロジェクトの一部です。最新の情報については、プロジェクトのREADMEを参照してください。*
