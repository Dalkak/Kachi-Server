"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ws_1 = __importDefault(require("ws"));
var wss = new ws_1["default"].Server({ port: 8080 });
wss.on("connection", function (ws) {
    ws.on("message", function (msg) {
        if (msg == "ping") {
            ws.send("pong");
        }
    });
});
