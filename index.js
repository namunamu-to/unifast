const WebSocket = require('ws');
const https = require('https')
var fs = require('fs');
let wsStates = {};
const wsStateFIle = "./wsStates.json";
let nowUser = ""; //uuid

main();

function main(){
    readWsState();
    runManageWsServer();
    runManageHttpServer();
}


function saveWsState(){
    const json = JSON.stringify(wsStates);
    fs.writeFileSync(wsStateFIle, json);
}

function readWsState(){
    const jsonStr = fs.readFileSync(wsStateFIle, 'utf-8');
    return JSON.parse(jsonStr);
}


function runManageWsServer(){
    const port = 8446;
    const server = new WebSocket.Server({ port: port });

    
    // クライアントから接続される場合トリガーされる
    console.log("run manageWsServer");
    server.on('connection', (socket) => {
        console.log('Client connected');
    
        // 受信メッセージを処理
        socket.on('message', (data) => {

        });
    
        // 接続中止
        socket.on('close', () => {

        });
    });
}

function runManageHttpServer(){
    const options = {
        cert: fs.readFileSync('./fullchain.pem'),
        key: fs.readFileSync('./privkey.pem'),
    }

    console.log("管理画面サーバー起動");
    const manageViewServer = https.createServer(options);
    manageViewServer.on('request', (req, res) => {
        const url = req.url;
        let resStr = "";
        if(url == "/unifast/index.html" || url == "/unifast" || url == "/unifast/") resStr = fs.readFileSync("./index.html", 'utf-8');
        else if(url == "/unifast/wsStates") resStr = fs.readFileSync(wsStateFIle, 'utf-8');
        res.write(resStr);

        res.end()
    })
    
    manageViewServer.listen(8445, "galleon.yachiyo.tech");
}


function newWsServer(port){
    const server = new WebSocket.Server({ port: port });
    // クライアントから接続される場合トリガーされる
    console.log("run wsServer");
    console.log("port : " + port);
    server.on('connection', (socket) => {
        console.log('Client connected');
        wsStates[port] = server;
    
        // 受信メッセージを処理
        socket.on('message', (data) => {
        });
    
        // 接続中止
        socket.on('close', () => {
            delete wsStates[port];
        });
    });
}

function newWsState(stateName, port, wsKind){
    const script = "";
    if(wsKind == "client"){
        script = `
            const socket = new WebSocket('ws://localhost:toPort');

            // 接続ができた時にトリガーされる
            socket.onopen = () => {
                console.log('Connected to server');
            });

            // サーバーのメッセージが受信された時にトリガーされる
            socket.onmessage = (event) => {
                console.log("Received: " + event.data});
            };

            // 接続中止
            socket.onclose = () => {
                console.log('Connection closed');
            };
        `;
    }else if(wsKind == "server"){
        newWsServer(port);

        script = `
            server.on('connection', (socket) => {
                console.log('Client connected');
                wsStates[port] = server;
            
                // 受信メッセージを処理
                socket.on('message', (data) => {
                });
            
                // 接続中止
                socket.on('close', () => {
                    delete wsStates[port];
                });
            });
        `;
    }

    wsStates[port] = {
            "socketName": "クライアント1",
            "cron": "*****",
            "state": "停止中",
            "log": "aaa",
            "script": script,
    };
}

