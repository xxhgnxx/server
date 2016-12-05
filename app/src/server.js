"use strict";
var io = require("socket.io").listen(81);
var user_1 = require("./user");
var game_1 = require("./game/game");
exports.userService = new user_1.UserService();
exports.game = new game_1.Game();
var Data = (function () {
    function Data(userLsit) {
        if (userLsit === void 0) { userLsit = exports.userService.userLsit; }
        this.userLsit = userLsit;
    }
    return Data;
}());
exports.Data = Data;
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
        var dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = exports.userService.logout(socket.id);
        io.emit("system", dataOut);
    });
    socket.on("system", function (data) {
        console.log("收到客户端发来的system请求", data);
        switch (data.type) {
            case "login":
                {
                    console.log(Date().toString().slice(15, 25), "login", data.name);
                    var dataOut = new Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = exports.userService.login(socket.id, data.name);
                    dataOut.name = data.name;
                    io.emit("system", dataOut);
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
                    dataOut.name = exports.userService.socketIdToUser[socket.id];
                    io.emit("system", dataOut);
                    break;
                }
            default:
        }
    });
});
