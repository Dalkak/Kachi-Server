import WebSocket from "ws";

const timeout = 10000;

const wss = new WebSocket.Server({port: 8080});

const parseJSON = (msg: string) => {
    try{
        return JSON.parse(msg);
    }catch{
        return msg;
    }
};
const heartbeat = (ws: WebSocket) => {
    clearTimeout((ws as any).killer);
    (ws as any).killer = setTimeout(() => {
        ws.terminate();
        console.log("Killed");
    }, timeout);
};
wss.on("connection", ws => {
    console.log("New Connection");
    ws.on("message", (msg: string) => {
        let data = parseJSON(msg);
        //console.log(data);
        wss.clients.forEach(client => {
            client.send(msg);
        });
        console.log(`Sended to ${wss.clients.size}`);
    });
    ws.on("close", () => {
        clearInterval((ws as any).timer);
    });
    ws.on("pong", () => {
        console.log("Got pong");
        heartbeat(ws);
    });
    (ws as any).timer = setInterval(() => {
        ws.ping();
        heartbeat(ws);
    }, 1000);
});