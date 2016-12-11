"use strict";
var io = require("socket.io").listen(81);
var user_1 = require("./user");
var game_1 = require("./game/game");
var vote_1 = require("./game/vote");
exports.userService = new user_1.UserService();
exports.game = new game_1.Game();
exports.votesys = new vote_1.VoteSys();
var Data = (function () {
    function Data() {
        // 游戏数据
        this.started = false; // 游戏是否开始
        this.proIndex = 16; // 牌堆顶
        this.proList = new Array(); // 法案牌堆
        this.failTimes = 0; // 政府组件失败次数
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
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
                    dataOut.playerList = exports.game.playerList;
                    dataOut.fascistCount = exports.game.fascistCount;
                    dataOut.proIndex = exports.game.proIndex;
                    dataOut.proList = exports.game.proList;
                    dataOut.started = exports.game.started;
                    dataOut.name = exports.userService.socketIdToUser[socket.id];
                    dataOut.type = "gamestart";
                    send(exports.game.playerList, dataOut);
                    selectPre(exports.game.playerList[Math.floor(Math.random() * exports.game.playerList.length)]);
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    exports.game.setPrm(data.user);
                    console.log(Date().toString().slice(15, 25), "创建新投票");
                    exports.game.setVote();
                    var dataOut = new Data();
                    dataOut.type = "pleaseVote";
                    dataOut.playerList = exports.game.playerList;
                    dataOut.prm = exports.game.prm;
                    dataOut.pre = exports.game.pre;
                    dataOut.voteCount = exports.game.voteCount;
                    dataOut.nowVote = exports.game.nowVote;
                    send(exports.game.playerList, dataOut);
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), exports.userService.socketIdToUser[socket.id].name, "投票了");
                    var dataOut = new Data();
                    dataOut.type = "pleaseVote";
                    if (exports.game.getVote(exports.userService.socketIdToUser[socket.id].seatNo - 1, data.voteRes)) {
                        dataOut.voteRes = exports.game.voteRes;
                        console.log("投票完成", exports.game.voteCount + "/" + exports.game.nowVote.length, "结果", exports.game.voteRes + "/" + exports.game.nowVote.length);
                        if (exports.game.voteRes > exports.game.nowVote.length / 2) {
                            console.log("政府组建成功");
                            findPro();
                        }
                        else {
                            console.log("政府组建失败");
                            selectPre(exports.game.prenext);
                        }
                    }
                    else {
                        dataOut.nowVote = exports.game.nowVote;
                        dataOut.voteCount = exports.game.voteCount;
                        send(exports.game.playerList, dataOut);
                    }
                    break;
                }
            case "proSelect":
                {
                    proSelect(data.pro, data.proX3List);
                    break;
                }
            default:
                console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
        }
    });
});
function selectPre(player) {
    exports.game.selectPre(player);
    var dataOut = new Data();
    dataOut.playerList = exports.game.playerList;
    dataOut.pre = exports.game.pre;
    dataOut.prenext = exports.game.prenext;
    dataOut.type = "selectPrm";
    dataOut.pre = exports.game.pre;
    send(exports.game.playerList, dataOut);
}
function findPro(list) {
    exports.game.findPro(list);
    var dataOut = new Data();
    dataOut.type = "choosePro";
    var tmp = exports.game.playerList.filter(function (t) {
        return t.isPre !== true;
    });
    dataOut.proList = exports.game.proList;
    dataOut.proIndex = exports.game.proIndex;
    send(tmp, dataOut);
    dataOut.proX3List = exports.game.proX3List;
    send(exports.game.pre, dataOut);
}
function proSelect(proDiscard, list) {
    var dataOut = new Data();
    if (exports.game.proSelect(proDiscard, list)) {
        console.log("法案生效");
        dataOut.type = "proEff";
        dataOut.pro = exports.game.pro;
        send(exports.game.playerList, dataOut);
        if (exports.game.started) {
            console.log("通知选总理");
            var dataOut_1 = new Data();
            dataOut_1.playerList = exports.game.playerList;
            dataOut_1.pre = exports.game.pre;
            dataOut_1.prenext = exports.game.prenext;
            dataOut_1.type = "selectPrm";
            dataOut_1.pre = exports.game.pre;
            send(exports.game.playerList, dataOut_1);
        }
        else {
            console.log("游戏结束");
        }
    }
    else {
        console.log("告知总理选法案");
        var tmp = exports.game.playerList.filter(function (t) {
            return t.isPrm !== true;
        });
        send(tmp, dataOut);
        dataOut.proX3List = exports.game.proX3List;
        send(exports.game.prm, dataOut);
    }
}
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
