let io = require("socket.io").listen(81);
import { UserService } from "./userService";
import { Game } from "./game";
import { User } from "./user";
import { VoteSys } from "./vote";
import { Data } from "./data";
import { MsgData } from "./msgData";
export let userService = new UserService();
export let game: Game = new Game();
import  { EventEmitter } from "events";
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

let socketIdtoSocket = new Map();


io.on("connection", socket => {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);

    socket.on("disconnect", () => {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        socketIdtoSocket.delete(socket.id);
        let dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = userService.logout(socket.id);
        dataOut.playerList = userService.userList;
        io.emit("system", dataOut);
    });

    socket.on("system", data => {
        console.log("收到客户端发来的system请求", data.type, socket.id);
        io.emit(data.key);
        switch (data.type) {
            case "login":
                {
                    console.log(Date().toString().slice(15, 25), "login", data.name);
                    socketIdtoSocket[socket.id] = socket;
                    let dataOut = new Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = userService.login(socket, data.name);
                    dataOut.user = userService.socketIdToUser[socket.id];
                    dataOut.socketId = socket.id;
                    dataOut.userList = userService.userList;
                    dataOut.toWho = userService.userList;
                    send(dataOut);
                    break;
                }
            case "userSeat":
                {
                    console.log(Date().toString().slice(15, 25), "尝试坐下", data.name);
                    let dataOut = new MsgData();
                    dataOut.speakTime = 20;
                    setTimeout(() => {
                        console.log("发消息啦");
                        io.emit("system", dataOut);
                    }, 1000);

                    break;
                }
            case "gamestart":
                {
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    if (data = game.start(socket.id)) {
                        send(data);
                    } else {
                        console.log("人数不足");
                    }
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    send(game.setPrm(data.user));
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), userService.socketIdToUser[socket.id].name, "投票了");
                    send(game.getVote(socket.id, data.voteRes));
                    break;
                }
            case "proSelect":
                {
                    send(game.proSelect(data.pro, data.proX3List));
                    break;
                }
            case "invPlayer":
                {
                    send(game.invPlayer(data.target));
                    break;
                }
            case "toKill":
                {
                    send(game.toKill(data.target));
                    break;
                }
            case "preSelect":
                {
                    send(game.selectPre(data.user, true));
                    break;
                }

            // 普通文字消息
            case "sendMsg":
                {
                    console.log(Date().toString().slice(15, 25), socket.id, "发言");
                    let dataOut = new MsgData();
                    dataOut.msgFrom = userService.socketIdToUser[socket.id];
                    dataOut.msg = data.msg;
                    dataOut.toWho = userService.userList;
                    io.emit("system", dataOut);
                    break;
                }

            default:
                console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
        }
    });
});


myEmitter.on("Send_Sth", (data) => {
    if (Array.isArray(data.toWho)) {
        for (let v_toWho of data.toWho) {
            socketIdtoSocket[v_toWho.socketId].emit("system", data);
        }
    } else {
        socketIdtoSocket[data.toWho.socketId].emit("system", data);
    }
});



myEmitter.on("Send_Msg", () => {
  console.log("an event occurred!");
});



function send(data: Data | Array<Data>) {
    if (Array.isArray(data)) {
        for (let v_data of data) {
            if (Array.isArray(v_data.toWho)) {
                for (let v_toWho of v_data.toWho) {
                    socketIdtoSocket[v_toWho.socketId].emit("system", v_data);
                }
            } else {
                socketIdtoSocket[v_data.toWho.socketId].emit("system", v_data);
            }
        }
    } else {
        if (Array.isArray(data.toWho)) {
            for (let v_toWho of data.toWho) {
                socketIdtoSocket[v_toWho.socketId].emit("system", data);
            }
        } else {
            socketIdtoSocket[data.toWho.socketId].emit("system", data);
        }
    }
}
