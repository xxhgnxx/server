"use strict";
var io = require("socket.io").listen(81);
var userService_1 = require("./userService");
var game_1 = require("./game");
var data_1 = require("./data");
var msgData_1 = require("./msgData");
exports.userService = new userService_1.UserService();
exports.game = new game_1.Game();
var myEmitter_1 = require("./myEmitter");
var socketIdtoSocket = new Map();
io.on("connection", function (socket) {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket.on("disconnect", function () {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        socketIdtoSocket.delete(socket.id);
        var dataOut = new data_1.Data();
        dataOut.type = "logout";
        dataOut.msg = exports.userService.logout(socket.id);
        dataOut.playerList = exports.userService.userList;
        io.emit("system", dataOut);
    });
    socket.on("system", function (data) {
        console.log("收到客户端发来的system请求", data.type, socket.id);
        io.emit(data.key);
        switch (data.type) {
            case "login":
                {
                    console.log(Date().toString().slice(15, 25), "login", data.name);
                    socketIdtoSocket[socket.id] = socket;
                    var dataOut = new data_1.Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = exports.userService.login(socket, data.name);
                    dataOut.user = exports.userService.socketIdToUser[socket.id];
                    dataOut.socketId = socket.id;
                    dataOut.userList = exports.userService.userList;
                    dataOut.toWho = exports.userService.userList;
                    send(dataOut);
                    break;
                }
            case "userSeat":
                {
                    console.log(Date().toString().slice(15, 25), "尝试坐下", data.name);
                    myEmitter_1.myEmitter.emit("speak_start");
                    break;
                }
            case "gamestart":
                {
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    exports.game.start(socket.id);
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
                    exports.game.setPrm(data.user);
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), exports.userService.socketIdToUser[socket.id].name, "投票了");
                    exports.game.getVote(socket.id, data.voteRes);
                    break;
                }
            case "proSelect":
                {
                    exports.game.proSelect(data.pro, data.proX3List);
                    break;
                }
            case "invPlayer":
                {
                    exports.game.invPlayer(data.target);
                    break;
                }
            case "toKill":
                {
                    exports.game.toKill(data.target);
                    break;
                }
            case "preSelect":
                {
                    exports.game.selectPre(data.user, true);
                    break;
                }
            case "speak_end":
                {
                    myEmitter_1.myEmitter.emit("speak_end");
                    break;
                }
            // 普通文字消息
            case "sendMsg":
                {
                    console.log(Date().toString().slice(15, 25), socket.id, "发言");
                    var dataOut = new msgData_1.MsgData();
                    dataOut.msgFrom = exports.userService.socketIdToUser[socket.id];
                    dataOut.msg = data.msg;
                    dataOut.toWho = exports.userService.userList;
                    io.emit("system", dataOut);
                    break;
                }
            default:
                console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
        }
    });
});
myEmitter_1.myEmitter.on("Send_Sth", function (data) {
    if (Array.isArray(data.toWho)) {
        for (var _i = 0, _a = data.toWho; _i < _a.length; _i++) {
            var v_toWho = _a[_i];
            socketIdtoSocket[v_toWho.socketId].emit("system", data);
        }
    }
    else {
        socketIdtoSocket[data.toWho.socketId].emit("system", data);
    }
});
myEmitter_1.myEmitter.on("speak_start", function () {
    // 通知所有玩家 进入发言状态
    var data = new data_1.Data();
    data.type = "speak_start";
    data.toWho = exports.game.playerList;
    myEmitter_1.myEmitter.emit("Send_Sth", data);
    // 启动发言计时
    var msgData = new msgData_1.MsgData();
    msgData.toWho = exports.game.playerList;
    msgData.speakTime = exports.game.speakTime;
    msgData.whoIsSpeaking = exports.game.pre;
    myEmitter_1.myEmitter.emit("Send_Sth", msgData);
    var timer = setTimeout(function () {
        msgData.whoIsSpeaking = exports.game.prm;
        myEmitter_1.myEmitter.emit("Send_Sth", msgData);
        timer = setTimeout(function () {
            console.log("时间到,发言结束");
        }, exports.game.speakTime * 1000);
        myEmitter_1.myEmitter.once("speak_end", function () {
            console.log("对方主动结束发言");
            clearTimeout(timer);
        });
    }, exports.game.speakTime * 1000);
    myEmitter_1.myEmitter.once("speak_end", function () {
        console.log("对方主动结束发言");
        clearTimeout(timer);
        msgData.whoIsSpeaking = exports.game.prm;
        myEmitter_1.myEmitter.emit("Send_Sth", msgData);
        timer = setTimeout(function () {
            console.log("时间到,发言结束");
        }, exports.game.speakTime * 1000);
        myEmitter_1.myEmitter.once("speak_end", function () {
            console.log("对方主动结束发言");
            clearTimeout(timer);
        });
    });
    // 总统发言
    // 总理发言
    // 其他玩家发言
    var SurvivalCount = 0;
    exports.game.playerList.filter(function (t) {
        if (t.isSurvival) {
            SurvivalCount++;
        }
    });
    for (var i = 1; i < SurvivalCount; i++) {
    }
});
function send(data) {
    if (Array.isArray(data)) {
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var v_data = data_2[_i];
            if (Array.isArray(v_data.toWho)) {
                for (var _a = 0, _b = v_data.toWho; _a < _b.length; _a++) {
                    var v_toWho = _b[_a];
                    socketIdtoSocket[v_toWho.socketId].emit("system", v_data);
                }
            }
            else {
                socketIdtoSocket[v_data.toWho.socketId].emit("system", v_data);
            }
        }
    }
    else {
        if (Array.isArray(data.toWho)) {
            for (var _c = 0, _d = data.toWho; _c < _d.length; _c++) {
                var v_toWho = _d[_c];
                socketIdtoSocket[v_toWho.socketId].emit("system", data);
            }
        }
        else {
            socketIdtoSocket[data.toWho.socketId].emit("system", data);
        }
    }
}
