// 必要なライブラリをインポート
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

// ExpressアプリとHTTPサーバーを作成
const app = express();
const server = http.createServer(app);

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ server });

// 接続しているクライアント（ブラウザ）を格納するセット
const clients = new Set();

// サーバーにクライアントが接続したときの処理
wss.on('connection', (ws) => {
    console.log('新しいクライアントが接続しました。');
    clients.add(ws); // クライアントをリストに追加

    // クライアントからメッセージを受信したときの処理
    ws.on('message', (message) => {
        const messageString = message.toString();
        console.log(`受信メッセージ: ${messageString}`);

        // 受信したメッセージを接続している**全クライアント**に送信（ブロードキャスト）
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
    });

    // クライアントが切断したときの処理
    ws.on('close', () => {
        console.log('クライアントが切断しました。');
        clients.delete(ws); // リストから削除
    });

    // 最初に接続したクライアントにウェルカムメッセージを送信
    ws.send(JSON.stringify({
        type: 'system',
        text: 'チャットルームへようこそ！'
    }));
});

// 静的ファイル（index.htmlなど）を公開するための設定
app.use(express.static('public')); 

// サーバーを起動
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`サーバーはポート ${PORT} で稼働中です。`);
});
