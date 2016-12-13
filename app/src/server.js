"use strict";
var io = require("socket.io").listen(81);
var userService_1 = require("./userService");
var game_1 = require("./game");
var vote_1 = require("./vote");
var data_1 = require("./data");
exports.userService = new userService_1.UserService();
exports.game = new game_1.Game();
exports.votesys = new vote_1.VoteSys();
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
                }
            case "gamestart":
                {
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    if (data = exports.game.start(socket.id)) {
                        send(data);
                    }
                    else {
                        console.log("人数不足");
                    }
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    send(exports.game.setPrm(data.user));
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), exports.userService.socketIdToUser[socket.id].name, "投票了");
                    send(exports.game.getVote(socket.id, data.voteRes));
                    break;
                }
            case "proSelect":
                {
                    send(exports.game.proSelect(data.pro, data.proX3List));
                    break;
                }
            case "invPlayer":
                {
                    send(exports.game.invPlayer(data.target));
                    break;
                }
            case "toKill":
                {
                    send(exports.game.toKill(data.target));
                    break;
                }
            case "preSelect":
                {
                    send(exports.game.selectPre(data.user, true));
                    break;
                }
            default:
                console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
        }
    });
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
