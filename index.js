const WebSocket = require('ws');
const https = require('https')
const fs = require('fs');
const crypto = require("crypto");
const express = require("express");

const app = express()
const wsStateFile = "./wsStates.json";
let wsStates = readWsStates();
let nowUser = ""; //uuid
let lastSurvival;

const server = https.createServer({
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
}, app);

main();

function main(){
    readWsStates();
    // runManageWsServer();
    runManageHttpServer();
    restoreWsStates();
}


function saveWsStates(){
    const json = JSON.stringify(wsStates);
    fs.writeFileSync(wsStateFile, json);
}

function readWsStates(){
    const jsonStr = fs.readFileSync(wsStateFile, 'utf-8');
    return JSON.parse(jsonStr);
}


// function runManageWsServer(){
//     const port = 8446;
//     const server = new WebSocket.Server({ port: port });
    
//     // クライアントから接続される場合トリガーされる
//     console.log("run manageWsServer");
//     server.on('connection', (socket) => {
//         console.log('Client connected');
    
//         // 受信メッセージを処理
//         socket.on('message', (data) => {

//         });
    
//         // 接続中止
//         socket.on('close', () => {

//         });
//     });
// }

function restoreWsStates(){
    for(let port of Object.keys(wsStates)){
        if(wsStates[port]["state"] == "起動中") newWsServer(port);
    }
}

function makeResData(kind, strData){
    const res = {
        "kind" : kind,
        "data" : strData
    };

    return JSON.stringify(res);
}

function runManageHttpServer(){
    app.get('/unifast/index.html', (req, res) => {
        res.send(fs.readFileSync("./index.html", 'utf-8'));
        
        if(nowUser == "") {
            lastSurvival = new Date().getTime();
            nowUser = crypto.randomUUID();
            resStr = fs.readFileSync("./index.html", 'utf-8');
        } else{
            resStr = fs.readFileSync("./warkingUsingApp.html", 'utf-8');
        }
    });

    app.get('/unifast/wsStates', (req, res) => {
        res.send(makeResData("wsStates", fs.readFileSync(wsStateFile, 'utf-8')));
    });

    app.post('/unifast/addWsState', (req, res) => {
        const json = JSON.parse(req.body);
        
        addWsStates(json["wsName"], json["port"], json["wsKind"]);
        res.send(makeResData("wsStates", fs.readFileSync(wsStateFile, 'utf-8')));
    });

    app.get('/unifast/polling', (req, res) => {
        lastSurvival = new Date().getTime();
        res.send(makeResData("polling", ""));
    });

}



// 起動
server.listen("8445", () => {
    console.log('管理サーバーを起動しました')
});



// function runManageHttpServer(){
//     const options = {
//         cert: fs.readFileSync('./fullchain.pem'),
//         key: fs.readFileSync('./privkey.pem'),
//     }

//     const manageViewServer = https.createServer(options);
//     console.log("管理画面サーバー起動");
//     manageViewServer.on('request', (req, res) => {
//         const url = req.url;
//         let resStr = "wrong url";

//         if(new Date().getTime() - lastSurvival > 6000) nowUser = "";

//         if(url == "/unifast/index.html" || url == "/unifast" || url == "/unifast/") {
//             if(nowUser == "") {
//                 lastSurvival = new Date().getTime();
//                 nowUser = crypto.randomUUID();
//                 resStr = fs.readFileSync("./index.html", 'utf-8');

//             } else{
//                 resStr = fs.readFileSync("./warkingUsingApp.html", 'utf-8');
//             } 

//         } else if(url == "/unifast/wsStates") {
//             resStr = makeResData("wsStates", fs.readFileSync(wsStateFile, 'utf-8'));

//         } else if(url == "/unifast/addWsState") {
//             let data;
//             req.on('data', function(chunk) {
//                 data = chunk.toString();
//             }).on('end', function() {
//                 const json = JSON.parse(data);

//                 addWsStates(json["wsName"], json["port"], json["wsKind"]);
//                 resStr = makeResData("wsStates", fs.readFileSync(wsStateFile, 'utf-8'));
//             })

//         }else if(url == "/unifast/polling"){
//             lastSurvival = new Date().getTime();
//             resStr = makeResData("polling", "");

//         } else {
//             resStr = makeResData("err", "urlが間違っています");
//         }

//         res.write(resStr);
//         res.end()
//     })
    
//     manageViewServer.listen(8445, "galleon.yachiyo.tech");
// }

function newWsServer(port){
    const server = new WebSocket.Server({ port: port });
    // addWsStates();
    console.log("run wsServer");
    console.log("port : " + port);
    server.on('connection', (socket) => {
        console.log('Client connected');
    
        // 受信メッセージを処理
        socket.on('message', (data) => {
            console.log(data);
        });
    
        // 接続中止
        socket.on('close', () => {
        });
    });
}

function addWsStates(wsName, port, wsKind){
    let script = "";
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

    console.log(wsStates);
    wsStates[port] = {
        "wsName": wsName,
        "cron": "",
        "state": "停止中",
        "log": "",
        "script": script,
        "wsKind": wsKind,
    };
    console.log(wsStates);

    saveWsStates();
}