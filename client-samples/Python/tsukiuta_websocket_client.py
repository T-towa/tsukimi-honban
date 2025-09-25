#!/usr/bin/env python3
"""
月歌システム用 Python WebSocketクライアント
デスクトップアプリケーションやサーバーサイドで月歌データを受信するためのクライアント実装
"""

import asyncio
import json
import logging
import time
from typing import Callable, Optional, Dict, Any
import websockets
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK
import threading

class TsukiutaWebSocketClient:
    """月歌WebSocketクライアント"""
    
    def __init__(
        self,
        server_url: str = "ws://localhost:3002/unity",
        ping_interval: float = 30.0,
        reconnect_delay: float = 5.0,
        max_reconnect_attempts: int = 5,
        enable_debug_log: bool = True
    ):
        self.server_url = server_url
        self.ping_interval = ping_interval
        self.reconnect_delay = reconnect_delay
        self.max_reconnect_attempts = max_reconnect_attempts
        self.enable_debug_log = enable_debug_log
        
        # 接続状態
        self.websocket = None
        self.is_connected = False
        self.should_reconnect = True
        self.reconnect_attempts = 0
        
        # タスク
        self.ping_task = None
        self.listen_task = None
        self.reconnect_task = None
        
        # イベントハンドラ
        self.event_handlers: Dict[str, list] = {
            'connected': [],
            'disconnected': [],
            'tsukiuta_received': [],
            'error': []
        }
        
        # ログ設定
        if self.enable_debug_log:
            logging.basicConfig(
                level=logging.INFO,
                format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        self.logger = logging.getLogger('TsukiutaClient')

    def on(self, event: str, handler: Callable):
        """イベントリスナーを追加"""
        if event in self.event_handlers:
            self.event_handlers[event].append(handler)

    def off(self, event: str, handler: Callable):
        """イベントリスナーを削除"""
        if event in self.event_handlers and handler in self.event_handlers[event]:
            self.event_handlers[event].remove(handler)

    def emit(self, event: str, data: Any = None):
        """イベントを発火"""
        if event in self.event_handlers:
            for handler in self.event_handlers[event]:
                try:
                    if data is not None:
                        handler(data)
                    else:
                        handler()
                except Exception as e:
                    self.logger.error(f"Error in event handler for {event}: {e}")

    async def connect(self):
        """サーバーに接続"""
        if self.websocket and self.is_connected:
            self.logger.info("Already connected to server")
            return

        try:
            self.logger.info(f"Connecting to: {self.server_url}")
            
            self.websocket = await websockets.connect(self.server_url)
            self.is_connected = True
            self.reconnect_attempts = 0
            
            self.logger.info("Connected to Tsukiuta server")
            self.emit('connected')
            
            # Pingタスクを開始
            self.ping_task = asyncio.create_task(self._ping_loop())
            
            # メッセージ受信タスクを開始
            self.listen_task = asyncio.create_task(self._listen_loop())
            
        except Exception as e:
            self.logger.error(f"Connection error: {e}")
            self.emit('error', e)
            if self.should_reconnect:
                await self._schedule_reconnect()

    async def disconnect(self):
        """サーバーから切断"""
        self.should_reconnect = False
        
        # タスクをキャンセル
        if self.ping_task:
            self.ping_task.cancel()
        if self.listen_task:
            self.listen_task.cancel()
        if self.reconnect_task:
            self.reconnect_task.cancel()
        
        # WebSocket接続を閉じる
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
        
        self.is_connected = False
        self.logger.info("Disconnected from server")

    async def _listen_loop(self):
        """メッセージ受信ループ"""
        try:
            async for message in self.websocket:
                await self._handle_message(message)
        except (ConnectionClosedError, ConnectionClosedOK) as e:
            self.logger.info(f"Connection closed: {e}")
            self.is_connected = False
            self.emit('disconnected')
            
            if self.should_reconnect:
                await self._schedule_reconnect()
        except Exception as e:
            self.logger.error(f"Listen loop error: {e}")
            self.emit('error', e)

    async def _handle_message(self, data: str):
        """メッセージを処理"""
        try:
            message = json.loads(data)
            self.logger.info(f"Received message type: {message.get('type')}")
            
            message_type = message.get('type')
            
            if message_type == 'CONNECTION_CONFIRMED':
                self.logger.info(f"Connection confirmed: {message.get('message')}")
                
            elif message_type == 'NEW_TSUKIUTA':
                await self._handle_new_tsukiuta(message)
                
            elif message_type == 'PONG':
                self.logger.debug("Pong received")
                
            else:
                self.logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parsing message: {e}")
        except Exception as e:
            self.logger.error(f"Error handling message: {e}")
            self.emit('error', e)

    async def _handle_new_tsukiuta(self, message: Dict[str, Any]):
        """新しい月歌データを処理"""
        try:
            tsukiuta_data = message.get('data')
            if tsukiuta_data:
                self.logger.info(f"New Tsukiuta received: {tsukiuta_data.get('tsukiuta')}")
                self.emit('tsukiuta_received', tsukiuta_data)
            else:
                self.logger.warning("Tsukiuta data is missing")
                
        except Exception as e:
            self.logger.error(f"Error processing tsukiuta: {e}")
            self.emit('error', e)

    async def _ping_loop(self):
        """定期的にPingを送信"""
        try:
            while self.is_connected and self.websocket:
                await asyncio.sleep(self.ping_interval)
                
                if self.is_connected and self.websocket:
                    ping_message = {
                        'type': 'PING',
                        'timestamp': time.time()
                    }
                    
                    await self.websocket.send(json.dumps(ping_message))
                    self.logger.debug("Ping sent")
                    
        except asyncio.CancelledError:
            self.logger.debug("Ping loop cancelled")
        except Exception as e:
            self.logger.error(f"Ping loop error: {e}")

    async def _schedule_reconnect(self):
        """再接続をスケジュール"""
        if not self.should_reconnect or self.reconnect_attempts >= self.max_reconnect_attempts:
            self.logger.warning("Max reconnection attempts reached")
            return

        self.reconnect_attempts += 1
        delay = self.reconnect_delay * self.reconnect_attempts  # 指数バックオフ
        
        self.logger.info(f"Reconnecting in {delay}s... (attempt {self.reconnect_attempts})")
        
        try:
            await asyncio.sleep(delay)
            if self.should_reconnect and not self.is_connected:
                await self.connect()
        except asyncio.CancelledError:
            self.logger.debug("Reconnect cancelled")

    @property
    def connected(self) -> bool:
        """接続状態を取得"""
        return self.is_connected

    def run_forever(self):
        """イベントループを開始（ブロッキング）"""
        async def _run():
            await self.connect()
            try:
                while self.should_reconnect:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                self.logger.info("Keyboard interrupt received")
            finally:
                await self.disconnect()

        asyncio.run(_run())

    def start_background(self):
        """バックグラウンドでクライアントを開始"""
        def _background_run():
            self.run_forever()

        thread = threading.Thread(target=_background_run, daemon=True)
        thread.start()
        return thread


# 使用例とテスト用のコード
async def example_usage():
    """使用例"""
    
    # クライアントインスタンス作成
    client = TsukiutaWebSocketClient(
        server_url="ws://localhost:3002/unity",
        enable_debug_log=True
    )
    
    # イベントハンドラ設定
    def on_connected():
        print("✅ サーバーに接続しました")
    
    def on_disconnected():
        print("❌ サーバーから切断されました")
    
    def on_tsukiuta_received(tsukiuta_data):
        print("🌙 新しい月歌を受信:")
        print(f"   月歌: {tsukiuta_data.get('tsukiuta', 'N/A')}")
        print(f"   1行目: {tsukiuta_data.get('line1', 'N/A')} ({tsukiuta_data.get('syllables_line1', 0)}音)")
        print(f"   2行目: {tsukiuta_data.get('line2', 'N/A')} ({tsukiuta_data.get('syllables_line2', 0)}音)")
        print(f"   3行目: {tsukiuta_data.get('line3', 'N/A')} ({tsukiuta_data.get('syllables_line3', 0)}音)")
        print(f"   読み: {tsukiuta_data.get('reading', 'N/A')}")
        print(f"   解説: {tsukiuta_data.get('explanation', 'N/A')}")
        print(f"   感想: {tsukiuta_data.get('impression', 'N/A')}")
        print("-" * 50)
    
    def on_error(error):
        print(f"❗ エラーが発生しました: {error}")
    
    # イベントリスナー登録
    client.on('connected', on_connected)
    client.on('disconnected', on_disconnected)
    client.on('tsukiuta_received', on_tsukiuta_received)
    client.on('error', on_error)
    
    # 接続開始
    try:
        await client.connect()
        
        # 接続を維持（Ctrl+Cで終了）
        while client.should_reconnect:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\n終了します...")
    finally:
        await client.disconnect()


if __name__ == "__main__":
    """メイン実行"""
    print("🌙 月歌WebSocketクライアント起動中...")
    print("Ctrl+C で終了します")
    
    try:
        asyncio.run(example_usage())
    except KeyboardInterrupt:
        print("\n👋 プログラムを終了しました")
