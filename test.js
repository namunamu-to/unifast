const https = require('https')
const fs = require('fs');
const express = require('express')

const app = express()


const server = https.createServer({
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
}, app);

app.get('/unifast/index.html', (req, res) => {
    res.send(fs.readFileSync("./index.html", 'utf-8'));
});


// 起動
server.listen("8445", () => {
    console.log('起動しました')
});