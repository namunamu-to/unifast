const WebSocket = require('ws');
const https = require('https')
var fs = require('fs');
let socketState = {};

const options = {
    cert: fs.readFileSync('./fullchain.pem'),
    key: fs.readFileSync('./privkey.pem'),
}

console.log("管理画面サーバー起動");
const manageViewServer = https.createServer(options);
manageViewServer.on('request', (req, res) => {
    let resStr = fs.readFileSync("./index.html", 'utf-8');

    res.write(resStr)
    res.end()
})

manageViewServer.listen(8445, "galleon.yachiyo.tech");        

function makeWsServer(port){
    const server = new WebSocket.Server({ port: port });
    // クライアントから接続される場合トリガーされる
    console.log("run wsServer");
    console.log("port : " + port);
    server.on('connection', (socket) => {
        console.log('Client connected');
        socketState[port] = server;
    
        // 受信メッセージを処理
        socket.on('message', (data) => {
            console.log(`Received: ${data}`);
            // ここでメッセージの処理ロジックを追加
        });
    
        // 接続中止
        socket.on('close', () => {
            delete socketState[port];
            console.log('Client disconnected');
            console.log(socketState);
        });
    });

}

// makeWsServer(34542);