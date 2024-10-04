const WebSocket = require('ws');
// const http = require("http");
const https = require('https')
var fs = require('fs');
let connecting = true;

console.log("管理画面サーバー起動");
// const manageViewServer = http.createServer((request, response) => {
//     const url = request.url;
//     let resStr = fs.readFileSync("./index.html", 'utf-8');;

//     console.log(url);
//         response.write(resStr);
//         response.end();
// });

const options = {
    cert: fs.readFileSync('./fullchain.pem'),
    key: fs.readFileSync('./privkey.pem'),
}

const manageViewServer = https.createServer(options);
// manageViewServer.on((request, response) => {
//         const url = request.url;
//         let resStr = fs.readFileSync("./index.html", 'utf-8');
    
//         console.log(url);
//         response.write(resStr);
//         response.end();
//     });

manageViewServer.on('request', (req, res) => {
    let resStr = fs.readFileSync("./index.html", 'utf-8');
    res.write(resStr)
    res.end()
})

manageViewServer.listen(8445, "galleon.yachiyo.tech");



// try {
    //     eval("console.log('aaa')");
    //     eval("console.lo('bbb')");
    // } catch (e) {
        //     console.log('Error: ' + e.message);
        // }
        

function makeWsServer(port){
    const server = new WebSocket.Server({ port: port });
    // クライアントから接続される場合トリガーされる
    server.on('connection', (socket) => {
        console.log('Client connected');
    
        // while (connecting) {
        // 受信メッセージを処理
        socket.on('message', (data) => {
            console.log(`Received: ${data}`);
            // ここでメッセージの処理ロジックを追加
        });
    
        // 接続中止
        socket.on('close', () => {
            console.log('Client disconnected');
            connecting = false;
        });
        // }
    });

}