import * as WebSocket from "ws";

import {
    Extension, Block, Pack, Type, Variable, Event,
} from "dalkak";

import basic from "@dalkak/basic";

const typePack = new Pack({
    types: {
        server: Type.fromConstructor(WebSocket?.Server),
    }
});

const timeout = 10000;

const heartbeat = (ws: WebSocket) => {
    clearTimeout((ws as any).killer);
    (ws as any).killer = setTimeout(() => {
        ws.terminate();
        console.log("Killed");
    }, timeout);
};

export default new Extension({
    name: "Kachi-Server",
    blocks: {
        newServer: new Block({
            name: "newServer",
            template: "(새 서버): server",
            pack: typePack,
            func: () => {
                const wss = new WebSocket.Server({port: 8080});
                
                return wss;
            }
        }),
        serverReady: new Block({
            name: "serverReady",
            pack: Pack.mix(typePack, basic),
            template: "{서버 (server: server)와 신호 (ev: Event), 유저 변수 (client: Variable), 데이터 변수 (val: Variable) 연결하기}",
            func: ({server, ev, client, val}:{
                server: WebSocket.Server,
                ev: Event,
                client: Variable,
                val: Variable,
            }, project, local, platform) => {
                server.on("connection", ws => {
                    console.log("New Connection");
                    ws.on("message", (msg: string) => {
                        client.value = ws;
                        val.value = msg;
                        ev.fire(project, local, platform);
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
            }
        }),
        serverSend: new Block({
            name: "serverSend",
            template: "{유저 (client)에게 (data) 보내기}",
            func: ({client, data}: {
                client: WebSocket,
                data: string,
            }) => {
                client.send(data);
            }
        })
    }
});