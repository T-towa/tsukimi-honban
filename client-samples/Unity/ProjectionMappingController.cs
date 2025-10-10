using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// プロジェクションマッピングで月歌を表示するコントローラー
/// TsukiutaPollerと連携して自動的に新しい月歌を受信・表示します
/// </summary>
public class ProjectionMappingController : MonoBehaviour
{
    [Header("UI要素")]
    [Tooltip("月歌全体を表示するテキスト")]
    public TextMeshProUGUI tsukiutaFullText;

    [Tooltip("1行目を表示するテキスト")]
    public TextMeshProUGUI line1Text;

    [Tooltip("2行目を表示するテキスト")]
    public TextMeshProUGUI line2Text;

    [Tooltip("3行目を表示するテキスト")]
    public TextMeshProUGUI line3Text;

    [Tooltip("読み仮名を表示するテキスト")]
    public TextMeshProUGUI readingText;

    [Tooltip("説明を表示するテキスト")]
    public TextMeshProUGUI explanationText;

    [Header("アニメーション設定")]
    [Tooltip("月歌表示時のフェードイン時間")]
    public float fadeInDuration = 2f;

    [Tooltip("月歌表示時間")]
    public float displayDuration = 10f;

    [Tooltip("月歌フェードアウト時間")]
    public float fadeOutDuration = 2f;

    [Header("エフェクト")]
    [Tooltip("月歌表示時に再生するパーティクルエフェクト")]
    public ParticleSystem displayEffect;

    [Tooltip("月歌表示時に再生するオーディオ")]
    public AudioSource displayAudio;

    [Header("ポーラー設定")]
    [Tooltip("TsukiutaPollerコンポーネント")]
    public TsukiutaPoller poller;

    // 現在表示中の月歌
    private TsukiutaData currentTsukiuta;
    private bool isDisplaying = false;

    void Start()
    {
        // TsukiutaPollerが設定されていない場合は自動取得
        if (poller == null)
        {
            poller = FindObjectOfType<TsukiutaPoller>();
        }

        // ポーラーのイベントに登録
        if (poller != null)
        {
            poller.onTsukiutaReceived.AddListener(OnTsukiutaReceived);
            Debug.Log("✅ ProjectionMappingController connected to TsukiutaPoller");
        }
        else
        {
            Debug.LogError("❌ TsukiutaPoller not found! Please add TsukiutaPoller component to the scene.");
        }

        // 初期状態で非表示
        HideAllText();
    }

    void OnDestroy()
    {
        // イベント登録解除
        if (poller != null)
        {
            poller.onTsukiutaReceived.RemoveListener(OnTsukiutaReceived);
        }
    }

    /// <summary>
    /// 新しい月歌を受信した時のハンドラー
    /// </summary>
    private void OnTsukiutaReceived(TsukiutaData tsukiuta)
    {
        Debug.Log($"🌙 Received new Tsukiuta: {tsukiuta.tsukiuta}");

        // 既に表示中の場合はキューに追加する実装も可能
        if (!isDisplaying)
        {
            DisplayTsukiuta(tsukiuta);
        }
        else
        {
            Debug.Log("⏳ Currently displaying another tsukiuta, queuing...");
            // TODO: キューシステムを実装する場合はここに追加
        }
    }

    /// <summary>
    /// 月歌をプロジェクションマッピングで表示
    /// </summary>
    public void DisplayTsukiuta(TsukiutaData tsukiuta)
    {
        currentTsukiuta = tsukiuta;
        StartCoroutine(DisplaySequence(tsukiuta));
    }

    /// <summary>
    /// 月歌表示シーケンス
    /// </summary>
    private System.Collections.IEnumerator DisplaySequence(TsukiutaData tsukiuta)
    {
        isDisplaying = true;

        // エフェクト開始
        if (displayEffect != null)
        {
            displayEffect.Play();
        }

        // オーディオ再生
        if (displayAudio != null)
        {
            displayAudio.Play();
        }

        // テキスト設定
        SetTsukiutaText(tsukiuta);

        // フェードイン
        yield return StartCoroutine(FadeInText());

        // 表示時間待機
        yield return new WaitForSeconds(displayDuration);

        // フェードアウト
        yield return StartCoroutine(FadeOutText());

        // 非表示
        HideAllText();

        isDisplaying = false;
        Debug.Log("✅ Tsukiuta display completed");
    }

    /// <summary>
    /// 月歌テキストを設定
    /// </summary>
    private void SetTsukiutaText(TsukiutaData tsukiuta)
    {
        if (tsukiutaFullText != null)
        {
            tsukiutaFullText.text = tsukiuta.tsukiuta;
        }

        if (line1Text != null)
        {
            line1Text.text = tsukiuta.line1;
        }

        if (line2Text != null)
        {
            line2Text.text = tsukiuta.line2;
        }

        if (line3Text != null)
        {
            line3Text.text = tsukiuta.line3;
        }

        if (readingText != null)
        {
            readingText.text = tsukiuta.reading;
        }

        if (explanationText != null)
        {
            explanationText.text = tsukiuta.explanation;
        }
    }

    /// <summary>
    /// テキストフェードイン
    /// </summary>
    private System.Collections.IEnumerator FadeInText()
    {
        float elapsed = 0f;

        while (elapsed < fadeInDuration)
        {
            elapsed += Time.deltaTime;
            float alpha = Mathf.Clamp01(elapsed / fadeInDuration);

            SetTextAlpha(alpha);

            yield return null;
        }

        SetTextAlpha(1f);
    }

    /// <summary>
    /// テキストフェードアウト
    /// </summary>
    private System.Collections.IEnumerator FadeOutText()
    {
        float elapsed = 0f;

        while (elapsed < fadeOutDuration)
        {
            elapsed += Time.deltaTime;
            float alpha = 1f - Mathf.Clamp01(elapsed / fadeOutDuration);

            SetTextAlpha(alpha);

            yield return null;
        }

        SetTextAlpha(0f);
    }

    /// <summary>
    /// 全テキストのアルファ値を設定
    /// </summary>
    private void SetTextAlpha(float alpha)
    {
        if (tsukiutaFullText != null)
        {
            Color c = tsukiutaFullText.color;
            c.a = alpha;
            tsukiutaFullText.color = c;
        }

        if (line1Text != null)
        {
            Color c = line1Text.color;
            c.a = alpha;
            line1Text.color = c;
        }

        if (line2Text != null)
        {
            Color c = line2Text.color;
            c.a = alpha;
            line2Text.color = c;
        }

        if (line3Text != null)
        {
            Color c = line3Text.color;
            c.a = alpha;
            line3Text.color = c;
        }

        if (readingText != null)
        {
            Color c = readingText.color;
            c.a = alpha;
            readingText.color = c;
        }

        if (explanationText != null)
        {
            Color c = explanationText.color;
            c.a = alpha;
            explanationText.color = c;
        }
    }

    /// <summary>
    /// 全テキストを非表示
    /// </summary>
    private void HideAllText()
    {
        SetTextAlpha(0f);
    }

    /// <summary>
    /// ポーラーの統計情報を取得
    /// </summary>
    public PollerStats GetPollerStats()
    {
        if (poller != null)
        {
            return poller.GetStats();
        }

        return default(PollerStats);
    }

    /// <summary>
    /// 現在表示中かどうか
    /// </summary>
    public bool IsDisplaying()
    {
        return isDisplaying;
    }

    /// <summary>
    /// 現在の月歌を取得
    /// </summary>
    public TsukiutaData GetCurrentTsukiuta()
    {
        return currentTsukiuta;
    }
}
