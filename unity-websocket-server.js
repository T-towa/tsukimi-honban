const WebSocket = require('ws');
const cors = require('cors');
const express = require('express');

// Unity WebSocket Server for Tsukiuta notifications
class UnityWebSocketServer {
  constructor(port = 3002) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.wss = null;
    this.unityClients = new Set();

    // CORS設定
    this.app.use(cors());
    this.app.use(express.json());

    this.setupRoutes();
  }

  setupRoutes() {
    // ヘルスチェック
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        connectedClients: this.unityClients.size,
        timestamp: new Date().toISOString()
      });
    });

    // Unity接続状態確認
    this.app.get('/unity/status', (req, res) => {
      res.json({
        connected: this.unityClients.size > 0,
        clientCount: this.unityClients.size,
        timestamp: new Date().toISOString()
      });
    });

    // 月歌データをUnityに送信（外部から呼び出し用）
    this.app.post('/unity/send-tsukiuta', (req, res) => {
      const { tsukiuta } = req.body;

      if (!tsukiuta) {
        return res.status(400).json({ error: 'Tsukiuta data is required' });
      }

      const result = this.broadcastToUnity({
        type: 'NEW_TSUKIUTA',
        data: tsukiuta,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: result.success,
        message: result.message,
        sentToClients: result.clientCount
      });
    });
  }

  start() {
    // HTTP サーバー起動
    this.server = this.app.listen(this.port, () => {
      console.log(`Unity WebSocket Server running on port ${this.port}`);
    });

    // WebSocket サーバー起動
    this.wss = new WebSocket.Server({
      server: this.server,
      path: '/unity'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('Unity client connected:', req.connection.remoteAddress);

      // Unity クライアントとして登録
      this.unityClients.add(ws);

      // 接続確認メッセージを送信
      ws.send(JSON.stringify({
        type: 'CONNECTION_CONFIRMED',
        message: '月歌システムに接続されました',
        timestamp: new Date().toISOString()
      }));

      // メッセージ受信処理
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('Received from Unity:', data);

          // Unity からの ping に pong で応答
          if (data.type === 'PING') {
            ws.send(JSON.stringify({
              type: 'PONG',
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error('Error parsing Unity message:', error);
        }
      });

      // 切断処理
      ws.on('close', () => {
        console.log('Unity client disconnected');
        this.unityClients.delete(ws);
      });

      // エラー処理
      ws.on('error', (error) => {
        console.error('Unity WebSocket error:', error);
        this.unityClients.delete(ws);
      });
    });

    console.log('Unity WebSocket Server started successfully');
  }

  // Unity クライアントに月歌データをブロードキャスト
  broadcastToUnity(message) {
    if (this.unityClients.size === 0) {
      console.log('No Unity clients connected');
      return {
        success: false,
        message: 'No Unity clients connected',
        clientCount: 0
      };
    }

    let successCount = 0;
    const messageStr = JSON.stringify(message);

    this.unityClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
          successCount++;
          console.log('Sent tsukiuta to Unity client:', message.data.tsukiuta);
        } catch (error) {
          console.error('Error sending to Unity client:', error);
          this.unityClients.delete(ws);
        }
      } else {
        // 切断されたクライアントを削除
        this.unityClients.delete(ws);
      }
    });

    return {
      success: successCount > 0,
      message: `Sent to ${successCount} Unity clients`,
      clientCount: successCount
    };
  }

  stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
    console.log('Unity WebSocket Server stopped');
  }
}

// サーバー起動
if (require.main === module) {
  const server = new UnityWebSocketServer(3002);
  server.start();

  // 終了処理
  process.on('SIGINT', () => {
    console.log('\nShutting down Unity WebSocket Server...');
    server.stop();
    process.exit(0);
  });
}

module.exports = UnityWebSocketServer;