using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using WebSocketSharp;
using Newtonsoft.Json;

/// <summary>
/// 月歌システム用Unity WebSocketクライアント
/// 月歌データを受信してUnity内で処理するためのクライアント実装
/// </summary>
public class TsukiutaWebSocketClient : MonoBehaviour
{
    [Header("WebSocket設定")]
    [SerializeField] private string serverUrl = "ws://localhost:3002/unity";
    [SerializeField] private float pingInterval = 30f;
    [SerializeField] private float reconnectDelay = 5f;
    
    [Header("デバッグ")]
    [SerializeField] private bool enableDebugLog = true;
    
    // WebSocket接続
    private WebSocket webSocket;
    private bool isConnected = false;
    private bool shouldReconnect = true;
    
    // イベント
    public System.Action<TsukiutaData> OnTsukiutaReceived;
    public System.Action OnConnected;
    public System.Action OnDisconnected;
    
    // コルーチン
    private Coroutine pingCoroutine;
    private Coroutine reconnectCoroutine;

    void Start()
    {
        ConnectToServer();
    }

    void OnDestroy()
    {
        shouldReconnect = false;
        Disconnect();
    }

    /// <summary>
    /// サーバーに接続
    /// </summary>
    public void ConnectToServer()
    {
        if (webSocket != null && isConnected)
        {
            DebugLog("Already connected to server");
            return;
        }

        try
        {
            DebugLog($"Connecting to: {serverUrl}");
            
            webSocket = new WebSocket(serverUrl);
            
            // イベントハンドラ設定
            webSocket.OnOpen += OnWebSocketOpen;
            webSocket.OnMessage += OnWebSocketMessage;
            webSocket.OnClose += OnWebSocketClose;
            webSocket.OnError += OnWebSocketError;
            
            // 接続開始
            webSocket.Connect();
        }
        catch (Exception e)
        {
            DebugLog($"Connection error: {e.Message}");
            StartReconnect();
        }
    }

    /// <summary>
    /// サーバーから切断
    /// </summary>
    public void Disconnect()
    {
        shouldReconnect = false;
        
        if (pingCoroutine != null)
        {
            StopCoroutine(pingCoroutine);
            pingCoroutine = null;
        }
        
        if (reconnectCoroutine != null)
        {
            StopCoroutine(reconnectCoroutine);
            reconnectCoroutine = null;
        }
        
        if (webSocket != null)
        {
            webSocket.Close();
            webSocket = null;
        }
        
        isConnected = false;
    }

    /// <summary>
    /// WebSocket接続成功時
    /// </summary>
    private void OnWebSocketOpen(object sender, EventArgs e)
    {
        DebugLog("Connected to Tsukiuta server");
        isConnected = true;
        
        // Pingコルーチン開始
        if (pingCoroutine != null)
            StopCoroutine(pingCoroutine);
        pingCoroutine = StartCoroutine(PingCoroutine());
        
        // 接続イベント発火
        OnConnected?.Invoke();
    }

    /// <summary>
    /// WebSocketメッセージ受信時
    /// </summary>
    private void OnWebSocketMessage(object sender, MessageEventArgs e)
    {
        try
        {
            var message = JsonConvert.DeserializeObject<WebSocketMessage>(e.Data);
            DebugLog($"Received message type: {message.type}");
            
            switch (message.type)
            {
                case "CONNECTION_CONFIRMED":
                    DebugLog($"Connection confirmed: {message.message}");
                    break;
                    
                case "NEW_TSUKIUTA":
                    HandleNewTsukiuta(message);
                    break;
                    
                case "PONG":
                    DebugLog("Pong received");
                    break;
                    
                default:
                    DebugLog($"Unknown message type: {message.type}");
                    break;
            }
        }
        catch (Exception ex)
        {
            DebugLog($"Error parsing message: {ex.Message}");
        }
    }

    /// <summary>
    /// WebSocket切断時
    /// </summary>
    private void OnWebSocketClose(object sender, CloseEventArgs e)
    {
        DebugLog($"Connection closed: {e.Reason}");
        isConnected = false;
        
        if (pingCoroutine != null)
        {
            StopCoroutine(pingCoroutine);
            pingCoroutine = null;
        }
        
        OnDisconnected?.Invoke();
        
        if (shouldReconnect)
        {
            StartReconnect();
        }
    }

    /// <summary>
    /// WebSocketエラー時
    /// </summary>
    private void OnWebSocketError(object sender, ErrorEventArgs e)
    {
        DebugLog($"WebSocket error: {e.Message}");
        
        if (shouldReconnect)
        {
            StartReconnect();
        }
    }

    /// <summary>
    /// 新しい月歌データを処理
    /// </summary>
    private void HandleNewTsukiuta(WebSocketMessage message)
    {
        try
        {
            var tsukiutaJson = message.data.ToString();
            var tsukiutaData = JsonConvert.DeserializeObject<TsukiutaData>(tsukiutaJson);
            
            // データクリーンアップを実行
            var cleanedData = CleanTsukiutaData(tsukiutaData);
            
            DebugLog($"New Tsukiuta received: {cleanedData.tsukiuta}");
            
            // メインスレッドで実行
            StartCoroutine(InvokeOnMainThread(() => {
                OnTsukiutaReceived?.Invoke(cleanedData);
            }));
        }
        catch (Exception e)
        {
            DebugLog($"Error processing tsukiuta: {e.Message}");
        }
    }

    /// <summary>
    /// 定期的にPingを送信
    /// </summary>
    private IEnumerator PingCoroutine()
    {
        while (isConnected && webSocket != null)
        {
            yield return new WaitForSeconds(pingInterval);
            
            if (isConnected && webSocket != null && webSocket.ReadyState == WebSocketState.Open)
            {
                var pingMessage = new
                {
                    type = "PING",
                    timestamp = DateTime.UtcNow.ToString("o")
                };
                
                webSocket.Send(JsonConvert.SerializeObject(pingMessage));
                DebugLog("Ping sent");
            }
        }
    }

    /// <summary>
    /// 再接続処理
    /// </summary>
    private void StartReconnect()
    {
        if (reconnectCoroutine != null)
            return;
            
        reconnectCoroutine = StartCoroutine(ReconnectCoroutine());
    }

    private IEnumerator ReconnectCoroutine()
    {
        while (shouldReconnect && !isConnected)
        {
            DebugLog($"Reconnecting in {reconnectDelay} seconds...");
            yield return new WaitForSeconds(reconnectDelay);
            
            if (shouldReconnect && !isConnected)
            {
                ConnectToServer();
            }
        }
        
        reconnectCoroutine = null;
    }

    /// <summary>
    /// メインスレッドで実行
    /// </summary>
    private IEnumerator InvokeOnMainThread(System.Action action)
    {
        action?.Invoke();
        yield return null;
    }

    /// <summary>
    /// デバッグログ出力
    /// </summary>
    private void DebugLog(string message)
    {
        if (enableDebugLog)
        {
            Debug.Log($"[TsukiutaClient] {message}");
        }
    }

    /// <summary>
    /// 接続状態確認
    /// </summary>
    public bool IsConnected => isConnected;
    
    /// <summary>
    /// 月歌データをクリーンアップして不正な文字を除去
    /// </summary>
    private TsukiutaData CleanTsukiutaData(TsukiutaData originalData)
    {
        var cleanedData = new TsukiutaData
        {
            impression = CleanText(originalData.impression),
            tsukiuta = CleanText(originalData.tsukiuta),
            line1 = CleanText(originalData.line1),
            line2 = CleanText(originalData.line2),
            line3 = CleanText(originalData.line3),
            syllables_line1 = originalData.syllables_line1,
            syllables_line2 = originalData.syllables_line2,
            syllables_line3 = originalData.syllables_line3,
            reading = CleanReading(originalData.reading),
            explanation = CleanText(originalData.explanation)
        };
        
        return cleanedData;
    }
    
    /// <summary>
    /// テキストから制御文字を除去
    /// </summary>
    private string CleanText(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;
            
        // 制御文字を除去
        var cleaned = System.Text.RegularExpressions.Regex.Replace(text, @"[\x00-\x1F\x7F-\x9F]", "");
        return cleaned.Trim();
    }
    
    /// <summary>
    /// 読み仮名から不正な文字を除去（日本語文字のみ許可）
    /// </summary>
    private string CleanReading(string reading)
    {
        if (string.IsNullOrEmpty(reading))
            return reading;
            
        // ひらがな、カタカナ、漢字、スペース以外を除去
        var cleaned = System.Text.RegularExpressions.Regex.Replace(reading, @"[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000\s]", "");
        return cleaned.Trim();
    }
}

/// <summary>
/// WebSocketメッセージ構造
/// </summary>
[System.Serializable]
public class WebSocketMessage
{
    public string type;
    public object data;
    public string message;
    public string timestamp;
}

/// <summary>
/// 月歌データ構造
/// </summary>
[System.Serializable]
public class TsukiutaData
{
    public string impression;      // 感想
    public string tsukiuta;       // 完成した月歌
    public string line1;          // 1行目（5音）
    public string line2;          // 2行目（7音）
    public string line3;          // 3行目（5音）
    public int syllables_line1;   // 1行目の音数
    public int syllables_line2;   // 2行目の音数
    public int syllables_line3;   // 3行目の音数
    public string reading;        // ひらがな読み
    public string explanation;    // 解説
}
