const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Node.js 18以降でfetchが利用可能であることを確認
if (typeof fetch === 'undefined') {
  const { fetch } = require('undici');
  global.fetch = fetch;
}

const app = express();

// Unity変更追跡システム
class TsukiutaChangeTracker {
  constructor() {
    this.changes = new Map(); // clientId -> 変更リスト
    this.globalSequence = 0;
  }

  // 新しい変更を記録
  recordChange(tsukiutaData) {
    this.globalSequence++;
    const change = {
      id: this.globalSequence,
      timestamp: new Date().toISOString(),
      type: 'NEW_TSUKIUTA',
      data: tsukiutaData
    };

    // すべてのクライアントに変更を配信
    for (const [clientId, clientChanges] of this.changes) {
      clientChanges.push(change);

      // 最大100件まで保持
      if (clientChanges.length > 100) {
        clientChanges.shift();
      }
    }

    console.log(`Change recorded: ${change.id} - ${tsukiutaData.tsukiuta}`);
    return change;
  }

  // クライアントを登録
  registerClient(clientId) {
    if (!this.changes.has(clientId)) {
      this.changes.set(clientId, []);
      console.log(`Unity client registered: ${clientId}`);
    }
  }

  // クライアントの変更を取得
  getChanges(clientId, lastSequence = 0) {
    this.registerClient(clientId);
    const clientChanges = this.changes.get(clientId) || [];

    // lastSequence以降の変更のみ取得
    const newChanges = clientChanges.filter(change => change.id > lastSequence);

    return {
      changes: newChanges,
      hasChanges: newChanges.length > 0,
      latestSequence: newChanges.length > 0 ?
        Math.max(...newChanges.map(c => c.id)) : lastSequence,
      totalClients: this.changes.size
    };
  }

  // 確認済み変更を削除
  acknowledgeChanges(clientId, sequenceId) {
    const clientChanges = this.changes.get(clientId) || [];
    const updatedChanges = clientChanges.filter(change => change.id > sequenceId);
    this.changes.set(clientId, updatedChanges);

    console.log(`Client ${clientId} acknowledged changes up to sequence ${sequenceId}`);
  }

  // 統計情報
  getStats() {
    return {
      totalClients: this.changes.size,
      globalSequence: this.globalSequence,
      pendingChanges: Array.from(this.changes.values())
        .reduce((total, changes) => total + changes.length, 0)
    };
  }
}

const changeTracker = new TsukiutaChangeTracker();

// CORS設定
app.use(cors());
app.use(express.json());

// 静的ファイルの配信（Reactビルド済みファイル）
app.use(express.static(path.join(__dirname, 'build')));

// Unity変更確認用APIエンドポイント
app.get('/api/unity/check-changes', (req, res) => {
  const clientId = req.query.clientId || req.headers['unity-client-id'] || 'default-client';
  const lastSequence = parseInt(req.query.lastSequence || '0');

  try {
    const result = changeTracker.getChanges(clientId, lastSequence);

    res.json({
      success: true,
      clientId: clientId,
      hasChanges: result.hasChanges,
      changesCount: result.changes.length,
      changes: result.changes,
      latestSequence: result.latestSequence,
      serverInfo: {
        totalClients: result.totalClients,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error checking changes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check changes',
      message: error.message
    });
  }
});

// Unity変更確認応答用APIエンドポイント
app.post('/api/unity/acknowledge', (req, res) => {
  const { clientId, sequenceId } = req.body;

  if (!clientId || !sequenceId) {
    return res.status(400).json({
      success: false,
      error: 'clientId and sequenceId are required'
    });
  }

  try {
    changeTracker.acknowledgeChanges(clientId, sequenceId);

    res.json({
      success: true,
      message: 'Changes acknowledged',
      clientId: clientId,
      acknowledgedSequence: sequenceId
    });

  } catch (error) {
    console.error('Error acknowledging changes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge changes',
      message: error.message
    });
  }
});

// Unity統計情報用APIエンドポイント
app.get('/api/unity/stats', (req, res) => {
  try {
    const stats = changeTracker.getStats();

    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

// Unity変更手動記録用APIエンドポイント
app.post('/api/unity/record-change', async (req, res) => {
  const { tsukiutaData } = req.body;

  if (!tsukiutaData) {
    return res.status(400).json({ error: 'Tsukiuta data is required' });
  }

  try {
    const change = changeTracker.recordChange(tsukiutaData);

    res.json({
      success: true,
      message: 'Change recorded successfully',
      changeId: change.id,
      timestamp: change.timestamp
    });

  } catch (error) {
    console.error('Error recording change:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record change',
      message: error.message
    });
  }
});

// データクリーニングヘルパー関数
function cleanText(text) {
  if (!text) return text;
  // 制御文字を除去
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
}

function cleanReading(reading) {
  if (!reading) return reading;
  // ひらがな、カタカナ、漢字、スペース以外を除去
  return reading.replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000\s]/g, '').trim();
}

function cleanTsukiutaData(tsukiuta) {
  return {
    ...tsukiuta,
    impression: cleanText(tsukiuta.impression),
    tsukiuta: cleanText(tsukiuta.tsukiuta),
    line1: cleanText(tsukiuta.line1),
    line2: cleanText(tsukiuta.line2),
    line3: cleanText(tsukiuta.line3),
    reading: cleanReading(tsukiuta.reading),
    explanation: cleanText(tsukiuta.explanation)
  };
}

// Unity用: 未送信の月歌を取得してis_sent_to_unityを更新
app.get('/api/get-pending-tsukiutas', async (req, res) => {
  try {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    // Unity API用にはservice_role_keyを使用（より強い権限でUPDATE可能）
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
    const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log(`🔑 Using ${usingServiceRole ? 'SERVICE_ROLE' : 'ANON'} key for Supabase operations`);

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase configuration missing'
      });
    }

    // まずis_sent_to_unityフィールドが存在するかチェック
    let pendingTsukiutas;
    let usesSentFlag = false;

    try {
      // is_sent_to_unity = false の月歌を取得を試行
      const fetchResponse = await fetch(
        `${supabaseUrl}/rest/v1/tsukiutas?is_sent_to_unity=eq.false&order=created_at.asc&limit=10`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (fetchResponse.ok) {
        pendingTsukiutas = await fetchResponse.json();
        usesSentFlag = true;
      } else {
        throw new Error('Field may not exist');
      }
    } catch (fieldError) {
      // is_sent_to_unityフィールドが存在しない場合、最新10件を取得
      console.log('⚠️ is_sent_to_unity field not found, fetching latest 10 tsukiutas');
      const fallbackResponse = await fetch(
        `${supabaseUrl}/rest/v1/tsukiutas?order=created_at.desc&limit=10`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        console.error('Supabase fetch error:', errorText);
        return res.status(502).json({
          success: false,
          error: 'Failed to fetch tsukiutas',
          message: errorText
        });
      }

      pendingTsukiutas = await fallbackResponse.json();
    }

    if (pendingTsukiutas.length === 0) {
      return res.json({
        success: true,
        count: 0,
        tsukiutas: [],
        message: 'No pending tsukiutas'
      });
    }

    // データをクリーニング
    const cleanedTsukiutas = pendingTsukiutas.map(cleanTsukiutaData);

    // is_sent_to_unityフィールドが存在する場合のみ更新
    if (usesSentFlag) {
      const tsukiutaIds = pendingTsukiutas.map(t => t.id);
      console.log(`🔄 Updating ${tsukiutaIds.length} tsukiutas to is_sent_to_unity=true, IDs: ${tsukiutaIds.join(',')}`);

      const updateUrl = `${supabaseUrl}/rest/v1/tsukiutas?id=in.(${tsukiutaIds.join(',')})`;
      const updateBody = {
        is_sent_to_unity: true,
        sent_to_unity_at: new Date().toISOString()
      };
      
      console.log(`📡 UPDATE URL: ${updateUrl}`);
      console.log(`📦 UPDATE Body:`, updateBody);
      console.log(`🔑 Using key type: ${usingServiceRole ? 'SERVICE_ROLE' : 'ANON'}`);

      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateBody)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ Supabase update error:', updateResponse.status, errorText);
        // 更新失敗でもデータは返す
      } else {
        const updateResult = await updateResponse.json();
        console.log(`✅ Successfully updated ${updateResult.length} tsukiutas to is_sent_to_unity=true`);
      }
    } else {
      console.log('⚠️ is_sent_to_unity field not available, skipping update');
    }

    console.log(`✅ Unity用に${cleanedTsukiutas.length}件の月歌を送信 (送信フラグ: ${usesSentFlag ? '使用' : '未使用'})`);

    return res.json({
      success: true,
      count: cleanedTsukiutas.length,
      tsukiutas: cleanedTsukiutas,
      message: `${cleanedTsukiutas.length} tsukiutas sent to Unity`,
      usesSentFlag: usesSentFlag
    });

  } catch (error) {
    console.error('Error in get-pending-tsukiutas:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Unity通知用APIエンドポイント
app.post('/api/notify-unity', async (req, res) => {
  const { tsukiuta, unityEndpoint } = req.body;

  if (!tsukiuta) {
    return res.status(400).json({ error: 'Tsukiuta data is required' });
  }

  if (!unityEndpoint) {
    return res.status(400).json({ error: 'Unity endpoint URL is required' });
  }

  try {
    console.log('Sending tsukiuta to Unity endpoint:', unityEndpoint);

    // Unityアプリケーションに月歌データを送信
    const unityResponse = await fetch(unityEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'NEW_TSUKIUTA',
        data: tsukiuta,
        timestamp: new Date().toISOString(),
        source: 'tsukiuta-web-app'
      })
    });

    if (unityResponse.ok) {
      const unityResult = await unityResponse.json();
      console.log('Successfully sent tsukiuta to Unity');

      return res.json({
        success: true,
        message: 'Tsukiuta sent to Unity successfully',
        unityResponse: unityResult
      });
    } else {
      const errorText = await unityResponse.text();
      console.error('Unity endpoint responded with error:', unityResponse.status, errorText);

      return res.status(502).json({
        success: false,
        error: 'Unity endpoint error',
        status: unityResponse.status,
        message: errorText
      });
    }

  } catch (error) {
    console.error('Error sending tsukiuta to Unity:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to send to Unity',
      message: error.message
    });
  }
});

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
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Claude API Key configured: ${process.env.CLAUDE_API_KEY ? 'Yes' : 'No'}`);
});