let io = require("socket.io").listen(81);
import { UserService } from "./userService";
import { Game } from "./game";
import { User } from "./user";
import { VoteSys } from "./vote";
import { Data } from "./data";
import { MsgData } from "./msgData";
export let userService = new UserService();
export let game: Game = new Game();

import { myEmitter } from "./myEmitter";


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

                    myEmitter.emit("speak_start");


                    break;
                }
            case "gamestart":
                {
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    game.start(socket.id);
                    // if (data = game.start(socket.id)) {
                    //     send(data);
                    // } else {
                    //     console.log("人数不足");
                    // }
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    game.setPrm(data.user);
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), userService.socketIdToUser[socket.id].name, "投票了");
                    game.getVote(socket.id, data.voteRes);
                    break;
                }
            case "proSelect":
                {
                    game.proSelect(data.pro, data.proX3List);
                    break;
                }
            case "invPlayer":
                {
                    game.invPlayer(data.target);
                    break;
                }
            case "toKill":
                {
                    game.toKill(data.target);
                    break;
                }
            case "preSelect":
                {
                    game.selectPre(data.user, true);
                    break;
                }
            case "speak_end":
                {
                    myEmitter.emit("speak_end");
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



myEmitter.on("speak_start", () => {
    // 通知所有玩家 进入发言状态
    let data = new Data();
    data.type = "speak_start";
    data.toWho = game.playerList;
    myEmitter.emit("Send_Sth", data);
    // 启动发言计时

    let msgData = new MsgData();
    msgData.toWho = game.playerList;
    msgData.speakTime = game.speakTime;
    msgData.whoIsSpeaking = game.pre;
    myEmitter.emit("Send_Sth", msgData);

    let timer = setTimeout(() => {
        msgData.whoIsSpeaking = game.prm;
        myEmitter.emit("Send_Sth", msgData);
        timer = setTimeout(() => {
            console.log("时间到,发言结束");
        }, game.speakTime * 1000);
        myEmitter.once("speak_end", () => {
            console.log("对方主动结束发言");
            clearTimeout(timer);
        });

    }, game.speakTime * 1000);



    myEmitter.once("speak_end", () => {
        console.log("对方主动结束发言");
        clearTimeout(timer);
        msgData.whoIsSpeaking = game.prm;
        myEmitter.emit("Send_Sth", msgData);

        timer = setTimeout(() => {
            console.log("时间到,发言结束");
        }, game.speakTime * 1000);

        myEmitter.once("speak_end", () => {
            console.log("对方主动结束发言");
            clearTimeout(timer);

        });



    });

    // 总统发言

    // 总理发言


    // 其他玩家发言
    let SurvivalCount = 0;
    game.playerList.filter(t => {
        if (t.isSurvival) {
            SurvivalCount++;
        }
    });
    for (let i = 1; i < SurvivalCount; i++) {

    }


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
