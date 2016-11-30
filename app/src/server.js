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
var io = require("socket.io").listen(81);
var user_1 = require("./user");
var userService = new user_1.UserService();
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
    socket.on("login", function (socket, name) {
        console.log(Date().toString().slice(15, 25), "login", name);
        io.emit("loginSuccess", userService.login(socket, name), name);
    });
    socket.on("disconnect", function (socket) {
        console.log(socket["name"]);
        if (socket["name"]) {
            userService.logout(socket["name"]);
            console.log(Date().toString().slice(15, 25), "logout", socket["name"]);
            socket.emit("system", new Msg("logout", socket["name"]));
        }
        else {
            console.log(Date().toString().slice(15, 25), "未登录logout");
        }
    });
});
