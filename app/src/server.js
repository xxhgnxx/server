"use strict";
var io = require("socket.io").listen(81);
var user_1 = require("./user");
var game_1 = require("./game/game");
exports.userService = new user_1.UserService();
exports.game = new game_1.Game();
var Data = (function () {
    function Data() {
        this.proIndex = 16; // 牌堆顶
        this.proList = new Array(); // 法案牌堆
        this.started = false; // 游戏是否开始
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
        this.failTimes = 0; // 政府组件失败次数
        this.userList = exports.userService.userList;
    }
    return Data;
}());
exports.Data = Data;
var socketIdtoSocket = new Map();
var Msg = (function () {
    function Msg(msg, obj, data) {
        this.msg = msg;
        this.obj = obj;
        this.data = data;
    }
    return Msg;
}());
io.on("connection", function (socket) {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket.on("disconnect", function () {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        socketIdtoSocket.delete(socket.id);
        var dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = exports.userService.logout(socket.id);
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
                    var dataOut = new Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = exports.userService.login(socket, data.name);
                    dataOut.user = exports.userService.socketIdToUser[socket.id];
                    dataOut.socketId = socket.id;
                    send(dataOut.user, dataOut);
                    break;
                }
            case "userSeat":
                {
                    console.log(Date().toString().slice(15, 25), "尝试坐下", data.name);
                    var dataOut = new Data();
                    dataOut.msg = exports.userService.userSeat(socket.id);
                    dataOut.type = "userSeat";
                    dataOut.user = exports.userService.socketIdToUser[socket.id];
                    io.emit("system", dataOut);
                    break;
                }
            case "gamestart":
                {
                    ////////////////////// 未完成功能
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    exports.game.start();
                    var dataOut = new Data();
                    // let dataOut = game.start();
                    // dataOut.type = "gamestart";
                    dataOut.playerList = exports.game.playerList;
                    dataOut.fascistCount = exports.game.fascistCount;
                    dataOut.proIndex = exports.game.proIndex;
                    dataOut.proList = exports.game.proList;
                    dataOut.pre = exports.game.pre;
                    dataOut.started = exports.game.started;
                    dataOut.prenext = exports.game.prenext;
                    dataOut.voteList = exports.game.voteList;
                    dataOut.name = exports.userService.socketIdToUser[socket.id];
                    dataOut.type = "gamestart";
                    send(exports.game.playerList, dataOut);
                    break;
                }
            default:
        }
    });
});
function send(who, data) {
    if (Array.isArray(who)) {
        for (var n in who) {
            socketIdtoSocket[who[n].socketId].emit("system", data);
        }
    }
    else {
        socketIdtoSocket[who.socketId].emit("system", data);
    }
}
