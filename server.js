// Express サーバー - Claude API プロキシ
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 環境変数読み込み
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// CORS設定
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.207:3000'],
  credentials: true
}));

// JSONパーサー
app.use(express.json());

// Claude API プロキシエンドポイント
app.post('/api/generate-tsukiuta', async (req, res) => {
  try {
    const { feelings } = req.body;

    if (!feelings || feelings.length === 0) {
      return res.status(400).json({ error: '感想が必要です' });
    }

    const impressionText = feelings.join('、');

    const prompt = `
# 月歌（つきうた）生成タスク

## 基本情報
金澤月見光路イベントの「月歌」を生成してください。以下の感想から、趣のある5-7-5形式の短詩を創作してください。

## 月歌の定義
- 形式：5-7-5の17音（厳密に守る）
- コンセプト：月のかぐや姫へ想いを届ける短詩

## 音数カウントの厳密なルール
- 各行は正確に5-7-5音
- 拗音（きゃ、しゅ、ちょ等）= 1音
- 促音「っ」= 1音
- 長音「ー」= 1音
- 「ん」= 1音

## 来場者の感想
${impressionText}

## 作成指示
1. 上記の感想を踏まえて、月のかぐや姫に届ける美しい5-7-5の月歌を1つ生成
2. 金沢の秋、月見、竹取物語の要素を自然に織り込む
3. 幻想的で温かみのある表現を使う
4. 各行の音数を厳密に守る
5. 各行の正確な音数をカウントして含める

JSONフォーマットで以下の形式で応答してください：
{
  "impression": "${impressionText}",
  "tsukiuta": "完成した月歌（改行なし、各行をスペースで区切る）",
  "line1": "5音の句",
  "line2": "7音の句",
  "line3": "5音の句",
  "syllables_line1": 5,
  "syllables_line2": 7,
  "syllables_line3": 5,
  "reading": "ひらがな読み"
}

必ず各行の音数は5-7-5になるようにし、syllables_line1=5, syllables_line2=7, syllables_line3=5を守ってください。
JSON形式のみで応答し、他のテキストは含めないでください。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Claude API エラー: ${errorText}`
      });
    }

    const data = await response.json();
    console.log('Claude API Response received');

    if (!data.content || !data.content[0] || !data.content[0].text) {
      return res.status(500).json({
        error: 'Claude API からの応答が不正です'
      });
    }

    let responseText = data.content[0].text;
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(responseText);
    res.json(result);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: `サーバーエラー: ${error.message}`
    });
  }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Claude API プロキシサーバー稼働中',
    hasApiKey: !!process.env.REACT_APP_CLAUDE_API_KEY
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Claude API プロキシサーバー起動: http://localhost:${PORT}`);
  console.log(`📝 API キー設定: ${process.env.REACT_APP_CLAUDE_API_KEY ? '✅' : '❌'}`);
});