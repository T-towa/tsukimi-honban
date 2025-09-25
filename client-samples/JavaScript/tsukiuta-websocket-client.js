/**
 * 月歌システム用 JavaScript WebSocketクライアント
 * ブラウザ環境で月歌データを受信するためのクライアント実装
 */
class TsukiutaWebSocketClient {
    constructor(options = {}) {
        this.serverUrl = options.serverUrl || 'ws://localhost:3002/unity';
        this.pingInterval = options.pingInterval || 30000; // 30秒
        this.reconnectDelay = options.reconnectDelay || 5000; // 5秒
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.enableDebugLog = options.enableDebugLog !== false;
        
        // WebSocket接続
        this.webSocket = null;
        this.isConnected = false;
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        
        // タイマー
        this.pingTimer = null;
        this.reconnectTimer = null;
        
        // イベントハンドラ
        this.eventHandlers = {
            connected: [],
            disconnected: [],
            tsukiutaReceived: [],
            error: []
        };
    }

    /**
     * イベントリスナーを追加
     */
    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    /**
     * イベントリスナーを削除
     */
    off(event, handler) {
        if (this.eventHandlers[event]) {
            const index = this.eventHandlers[event].indexOf(handler);
            if (index > -1) {
                this.eventHandlers[event].splice(index, 1);
            }
        }
    }

    /**
     * イベントを発火
     */
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    this.debugLog(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * サーバーに接続
     */
    connect() {
        if (this.webSocket && this.isConnected) {
            this.debugLog('Already connected to server');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.debugLog(`Connecting to: ${this.serverUrl}`);
                
                this.webSocket = new WebSocket(this.serverUrl);
                
                // 接続成功
                this.webSocket.onopen = (event) => {
                    this.debugLog('Connected to Tsukiuta server');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    
                    // Pingタイマー開始
                    this.startPingTimer();
                    
                    this.emit('connected', event);
                    resolve();
                };
                
                // メッセージ受信
                this.webSocket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                // 接続切断
                this.webSocket.onclose = (event) => {
                    this.debugLog(`Connection closed: ${event.reason}`);
                    this.isConnected = false;
                    this.stopPingTimer();
                    
                    this.emit('disconnected', event);
                    
                    if (this.shouldReconnect) {
                        this.scheduleReconnect();
                    }
                };
                
                // エラー
                this.webSocket.onerror = (error) => {
                    this.debugLog('WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };
                
            } catch (error) {
                this.debugLog('Connection error:', error);
                this.emit('error', error);
                reject(error);
            }
        });
    }

    /**
     * サーバーから切断
     */
    disconnect() {
        this.shouldReconnect = false;
        this.stopPingTimer();
        this.stopReconnectTimer();
        
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = null;
        }
        
        this.isConnected = false;
    }

    /**
     * メッセージを処理
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            this.debugLog(`Received message type: ${message.type}`);
            
            switch (message.type) {
                case 'CONNECTION_CONFIRMED':
                    this.debugLog(`Connection confirmed: ${message.message}`);
                    break;
                    
                case 'NEW_TSUKIUTA':
                    this.handleNewTsukiuta(message);
                    break;
                    
                case 'PONG':
                    this.debugLog('Pong received');
                    break;
                    
                default:
                    this.debugLog(`Unknown message type: ${message.type}`);
                    break;
            }
        } catch (error) {
            this.debugLog('Error parsing message:', error);
        }
    }

    /**
     * 新しい月歌データを処理
     */
    handleNewTsukiuta(message) {
        try {
            const tsukiutaData = message.data;
            this.debugLog(`New Tsukiuta received: ${tsukiutaData.tsukiuta}`);
            
            this.emit('tsukiutaReceived', tsukiutaData);
        } catch (error) {
            this.debugLog('Error processing tsukiuta:', error);
            this.emit('error', error);
        }
    }

    /**
     * Pingタイマーを開始
     */
    startPingTimer() {
        this.stopPingTimer();
        
        this.pingTimer = setInterval(() => {
            if (this.isConnected && this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
                const pingMessage = {
                    type: 'PING',
                    timestamp: new Date().toISOString()
                };
                
                this.webSocket.send(JSON.stringify(pingMessage));
                this.debugLog('Ping sent');
            }
        }, this.pingInterval);
    }

    /**
     * Pingタイマーを停止
     */
    stopPingTimer() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * 再接続をスケジュール
     */
    scheduleReconnect() {
        if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.debugLog('Max reconnection attempts reached');
            return;
        }

        this.stopReconnectTimer();
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts; // 指数バックオフ
        
        this.debugLog(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
        
        this.reconnectTimer = setTimeout(() => {
            if (this.shouldReconnect && !this.isConnected) {
                this.connect().catch(error => {
                    this.debugLog('Reconnection failed:', error);
                });
            }
        }, delay);
    }

    /**
     * 再接続タイマーを停止
     */
    stopReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * デバッグログ出力
     */
    debugLog(...args) {
        if (this.enableDebugLog) {
            console.log('[TsukiutaClient]', ...args);
        }
    }

    /**
     * 接続状態を取得
     */
    get connected() {
        return this.isConnected;
    }

    /**
     * WebSocketの状態を取得
     */
    get readyState() {
        return this.webSocket ? this.webSocket.readyState : WebSocket.CLOSED;
    }
}

// ブラウザ環境でのエクスポート
if (typeof window !== 'undefined') {
    window.TsukiutaWebSocketClient = TsukiutaWebSocketClient;
}

// Node.js環境でのエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TsukiutaWebSocketClient;
}

/**
 * 使用例
 */
/*
// クライアントインスタンス作成
const client = new TsukiutaWebSocketClient({
    serverUrl: 'ws://localhost:3002/unity',
    enableDebugLog: true
});

// イベントリスナー設定
client.on('connected', () => {
    console.log('サーバーに接続しました');
});

client.on('disconnected', () => {
    console.log('サーバーから切断されました');
});

client.on('tsukiutaReceived', (tsukiutaData) => {
    console.log('新しい月歌を受信:', tsukiutaData);
    
    // 月歌をページに表示
    displayTsukiuta(tsukiutaData);
});

client.on('error', (error) => {
    console.error('エラーが発生しました:', error);
});

// 接続開始
client.connect().then(() => {
    console.log('接続処理が完了しました');
}).catch((error) => {
    console.error('接続に失敗しました:', error);
});

// 月歌表示関数の例
function displayTsukiuta(tsukiutaData) {
    const container = document.getElementById('tsukiuta-container');
    if (container) {
        container.innerHTML = `
            <div class="tsukiuta">
                <h3>新しい月歌</h3>
                <div class="tsukiuta-lines">
                    <div class="line">${tsukiutaData.line1} (${tsukiutaData.syllables_line1}音)</div>
                    <div class="line">${tsukiutaData.line2} (${tsukiutaData.syllables_line2}音)</div>
                    <div class="line">${tsukiutaData.line3} (${tsukiutaData.syllables_line3}音)</div>
                </div>
                <div class="reading">${tsukiutaData.reading}</div>
                <div class="explanation">${tsukiutaData.explanation}</div>
                <div class="impression">感想: ${tsukiutaData.impression}</div>
            </div>
        `;
    }
}
*/
