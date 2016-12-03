// var path = require("path");
// var express = require("express");
// var app = express();
// var server = require("http").createServer(app);
// console.log(path.resolve("dist"));
//
// app.use("/", express.static(path.resolve("dist")));
// server.listen(80);
//
//
"use strict";
var _this = this;
var io = require("socket.io").listen(81);
var user_1 = require("./user");
var userService = new user_1.UserService();
var Data = (function () {
    function Data(type, name, userLsit, msg, user) {
        this.type = type;
        this.name = name;
        this.userLsit = userLsit;
        this.msg = msg;
        this.user = user;
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
        console.log(Date().toString().slice(15, 25), "login", name);
        console.log(userService.roomLsit[0]);
        io.emit("upDataList", userService.roomLsit);
        io.emit("loginSuccess", new Data(_this.type = "login", _this.msg = userService.login(socket, name), _this.name = name));
    });
    socket.on("disconnect", function () {
        console.log(socket.id, "离线");
        Data["msg"] = userService.logout(socket.id);
        Data["userLsit"] = userService.userLsit;
        Data["type"] = "logout";
        io.emit("upDataList", userService.roomLsit);
        io.emit("system", Data);
    });
    socket.on("system", function (type, data) {
        switch (type) {
            case "gamestart":
                console.log("游戏开始");
                io.emit("system", new Data("gamestart"));
                break;
            default:
        }
    });
});
