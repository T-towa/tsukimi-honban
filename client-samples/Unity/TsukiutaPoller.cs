using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// 月歌Webアプリからプロジェクションマッピング用の月歌データを取得するポーリングシステム
/// 5秒間隔でAPIをポーリングし、新しい月歌を自動取得します
/// </summary>
public class TsukiutaPoller : MonoBehaviour
{
    [Header("API設定")]
    [Tooltip("月歌WebアプリのベースURL")]
    public string apiBaseUrl = "https://your-app.com";

    [Tooltip("ポーリング間隔（秒）")]
    [Range(1f, 60f)]
    public float pollInterval = 5f;

    [Header("デバッグ設定")]
    [Tooltip("デバッグログを表示")]
    public bool enableDebugLog = true;

    [Header("イベント")]
    [Tooltip("新しい月歌を受信した時のイベント")]
    public TsukiutaReceivedEvent onTsukiutaReceived;

    // ポーリング状態
    private bool isPolling = false;
    private Coroutine pollCoroutine;

    // 統計情報
    private int totalTsukiutasReceived = 0;
    private DateTime lastPollTime;
    private DateTime lastSuccessTime;

    void Start()
    {
        // 自動的にポーリング開始
        StartPolling();
    }

    void OnDestroy()
    {
        // アプリ終了時にポーリング停止
        StopPolling();
    }

    /// <summary>
    /// ポーリングを開始
    /// </summary>
    public void StartPolling()
    {
        if (isPolling)
        {
            LogDebug("Already polling");
            return;
        }

        isPolling = true;
        pollCoroutine = StartCoroutine(PollForNewTsukiutas());
        LogDebug($"Polling started with interval: {pollInterval}s");
    }

    /// <summary>
    /// ポーリングを停止
    /// </summary>
    public void StopPolling()
    {
        if (!isPolling)
        {
            return;
        }

        isPolling = false;
        if (pollCoroutine != null)
        {
            StopCoroutine(pollCoroutine);
            pollCoroutine = null;
        }
        LogDebug("Polling stopped");
    }

    /// <summary>
    /// ポーリング間隔を変更
    /// </summary>
    public void SetPollInterval(float newInterval)
    {
        pollInterval = Mathf.Max(1f, newInterval);

        // ポーリング中であれば再起動
        if (isPolling)
        {
            StopPolling();
            StartPolling();
        }

        LogDebug($"Poll interval changed to {pollInterval}s");
    }

    /// <summary>
    /// 手動で即座にポーリング実行
    /// </summary>
    public void PollNow()
    {
        StartCoroutine(FetchPendingTsukiutas());
    }

    /// <summary>
    /// 定期的に月歌をポーリング
    /// </summary>
    private IEnumerator PollForNewTsukiutas()
    {
        while (isPolling)
        {
            lastPollTime = DateTime.Now;
            yield return FetchPendingTsukiutas();

            // 次のポーリングまで待機
            yield return new WaitForSeconds(pollInterval);
        }
    }

    /// <summary>
    /// APIから未送信の月歌を取得
    /// </summary>
    private IEnumerator FetchPendingTsukiutas()
    {
        string url = $"{apiBaseUrl}/api/get-pending-tsukiutas";

        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            // タイムアウト設定（10秒）
            request.timeout = 10;

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                lastSuccessTime = DateTime.Now;

                try
                {
                    // レスポンスをパース
                    string jsonResponse = request.downloadHandler.text;
                    TsukiutaResponse response = JsonUtility.FromJson<TsukiutaResponse>(jsonResponse);

                    if (response.success && response.count > 0)
                    {
                        LogDebug($"✅ Received {response.count} new tsukiuta(s)");

                        // 各月歌を処理
                        foreach (TsukiutaData tsukiuta in response.tsukiutas)
                        {
                            ProcessTsukiuta(tsukiuta);
                        }
                    }
                    else
                    {
                        LogDebug("No pending tsukiutas");
                    }
                }
                catch (Exception e)
                {
                    Debug.LogError($"❌ Failed to parse response: {e.Message}\nResponse: {request.downloadHandler.text}");
                }
            }
            else
            {
                Debug.LogError($"❌ API request failed: {request.error}\nURL: {url}");
            }
        }
    }

    /// <summary>
    /// 受信した月歌を処理
    /// </summary>
    private void ProcessTsukiuta(TsukiutaData tsukiuta)
    {
        totalTsukiutasReceived++;

        // データクリーンアップを実行
        var cleanedTsukiuta = CleanTsukiutaData(tsukiuta);

        LogDebug($"🌙 New Tsukiuta #{totalTsukiutasReceived}:\n" +
                 $"  {cleanedTsukiuta.line1}\n" +
                 $"  {cleanedTsukiuta.line2}\n" +
                 $"  {cleanedTsukiuta.line3}\n" +
                 $"  Reading: {cleanedTsukiuta.reading}");

        // イベントを発火
        onTsukiutaReceived?.Invoke(cleanedTsukiuta);
    }

    /// <summary>
    /// デバッグログ出力
    /// </summary>
    private void LogDebug(string message)
    {
        if (enableDebugLog)
        {
            Debug.Log($"[TsukiutaPoller] {message}");
        }
    }

    /// <summary>
    /// 統計情報を取得
    /// </summary>
    public PollerStats GetStats()
    {
        return new PollerStats
        {
            isPolling = this.isPolling,
            pollInterval = this.pollInterval,
            totalReceived = this.totalTsukiutasReceived,
            lastPollTime = this.lastPollTime,
            lastSuccessTime = this.lastSuccessTime
        };
    }
    
    /// <summary>
    /// 月歌データをクリーンアップして不正な文字を除去
    /// </summary>
    private TsukiutaData CleanTsukiutaData(TsukiutaData originalData)
    {
        var cleanedData = new TsukiutaData
        {
            id = originalData.id,
            impression = CleanText(originalData.impression),
            tsukiuta = CleanText(originalData.tsukiuta),
            line1 = CleanText(originalData.line1),
            line2 = CleanText(originalData.line2),
            line3 = CleanText(originalData.line3),
            syllables_line1 = originalData.syllables_line1,
            syllables_line2 = originalData.syllables_line2,
            syllables_line3 = originalData.syllables_line3,
            reading = CleanReading(originalData.reading),
            explanation = CleanText(originalData.explanation),
            created_at = originalData.created_at,
            is_sent_to_unity = originalData.is_sent_to_unity,
            sent_to_unity_at = originalData.sent_to_unity_at
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
/// APIレスポンス構造
/// </summary>
[Serializable]
public class TsukiutaResponse
{
    public bool success;
    public int count;
    public string message;
    public TsukiutaData[] tsukiutas;
}

/// <summary>
/// 月歌データ構造
/// </summary>
[Serializable]
public class TsukiutaData
{
    public int id;
    public string impression;
    public string tsukiuta;
    public string line1;
    public string line2;
    public string line3;
    public int syllables_line1;
    public int syllables_line2;
    public int syllables_line3;
    public string reading;
    public string explanation;
    public string created_at;
    public bool is_sent_to_unity;
    public string sent_to_unity_at;
}

/// <summary>
/// 月歌受信イベント
/// </summary>
[Serializable]
public class TsukiutaReceivedEvent : UnityEngine.Events.UnityEvent<TsukiutaData> { }

/// <summary>
/// ポーラー統計情報
/// </summary>
public struct PollerStats
{
    public bool isPolling;
    public float pollInterval;
    public int totalReceived;
    public DateTime lastPollTime;
    public DateTime lastSuccessTime;
}
