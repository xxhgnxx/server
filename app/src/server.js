"use strict";
var _this = this;
var io = require("socket.io").listen(81);
var user_1 = require("./user");
var game_1 = require("./game/game");
exports.userService = new user_1.UserService();
var Data = (function () {
    function Data(userLsit) {
        if (userLsit === void 0) { userLsit = exports.userService.userLsit; }
        this.userLsit = userLsit;
    }
    return Data;
}());
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
    socket.on("login", function (name) {
        var dataOut = new Data();
        dataOut.type = "loginSuccess";
        dataOut.msg = exports.userService.login(socket.id, name);
        dataOut.name = name;
        io.emit("system", dataOut);
    });
    socket.on("disconnect", function () {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        var dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = exports.userService.logout(socket.id);
        io.emit("system", dataOut);
    });
    socket.on("system", function (data) {
        console.log("system请求", data);
        switch (data.type) {
            case "login":
                {
                    console.log(Date().toString().slice(15, 25), "login", name);
                    var dataOut = new Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = exports.userService.login(socket.id, name);
                    dataOut.name = name;
                    io.emit("system", dataOut);
                    break;
                }
            case "userSeat":
                {
                    console.log(Date().toString().slice(15, 25), "坐下", data.name);
                    var dataOut = new Data();
                    dataOut.msg = exports.userService.userSeat(socket.id, name);
                    dataOut.type = "userSeat";
                    io.emit("system", dataOut);
                    break;
                }
            case "gamestart":
                {
                    //////////////////////
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    exports.game = new game_1.Game();
                    _this.game.start();
                    var dataOut = new Data();
                    dataOut.type = "gamestart";
                    dataOut.name = exports.userService.socketIdToUser[socket.id];
                    io.emit("system", dataOut);
                    break;
                }
            default:
        }
    });
});
