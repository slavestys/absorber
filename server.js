const express = require('express');
const app = express();
const http = require('http');
const colyseus = require("colyseus");
const serveIndex = require("serve-index");
const FieldRoom = require('./server/rooms/field_room');
const monitor = require('@colyseus/monitor');

const path = require("path");
const port = 3000;
var staticPath = path.join(__dirname, "client");

const gameServer = new colyseus.Server({
    server: http.createServer(app)
});
app.use(express.static(staticPath));
app.use('/', serveIndex(staticPath, {'icons': true}));
app.use('/colyseus', monitor.monitor(gameServer));
gameServer.register("field", FieldRoom);

gameServer.listen(port);
console.log(`Listening on http://localhost:${ port }`);

