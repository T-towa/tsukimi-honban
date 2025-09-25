const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS設定
app.use(cors());
app.use(express.json());

// 静的ファイルの配信（Reactビルド済みファイル）
app.use(express.static(path.join(__dirname, 'build')));

// Claude APIプロキシエンドポイント
app.post('/api/generate-tsukiuta', async (req, res) => {
  try {
    const { feelings } = req.body;

    if (!feelings || feelings.length === 0) {
      return res.status(400).json({ error: '感想が必要です' });
    }

    // Claude API キーの確認
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      console.error('Claude API key not found in environment variables');
      return res.status(500).json({ error: 'Claude API キーが設定されていません' });
    }

    console.log('Claude API Key exists:', claudeApiKey ? 'Yes' : 'No');
    console.log('Feelings received:', feelings);

    // 感想を統合したプロンプトを作成
    const feelingsText = feelings.join('、');
    const prompt = `金沢の月見光路での体験について、以下の感想をもとに日本の短詩「月歌」を生成してください：

感想: ${feelingsText}

出力は必ず以下のJSON形式で返してください：
{
  "impression": "${feelingsText}",
  "tsukiuta": "5-7-5の月歌全体",
  "line1": "最初の句（5音）",
  "line2": "中の句（7音）",
  "line3": "最後の句（5音）",
  "syllables_line1": 5,
  "syllables_line2": 7,
  "syllables_line3": 5,
  "reading": "ひらがなの読み方"
}

月歌は日本の伝統的な詩形で、自然や季節、心情を美しく表現します。金沢の美しい月見と秋の情景を込めて作成してください。`;

    // Claude APIを呼び出し
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API Error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || 'Claude APIエラーが発生しました'
      });
    }

    const apiResult = await response.json();
    console.log('Claude API Response received');

    // レスポンスからテキストを抽出
    const content = apiResult.content?.[0]?.text;
    if (!content) {
      return res.status(500).json({ error: 'APIからの応答が無効です' });
    }

    // JSONパース
    let result;
    try {
      // JSONブロックから抽出を試行
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({ error: '生成された月歌の形式が正しくありません' });
    }

    console.log('Successfully generated tsukiuta');
    res.json(result);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// React アプリのルーティング（SPA対応）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Claude API Key configured: ${process.env.CLAUDE_API_KEY ? 'Yes' : 'No'}`);
});