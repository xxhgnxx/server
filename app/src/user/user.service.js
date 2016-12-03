"use strict";
var user_1 = require("./user");
var UserService = (function () {
    function UserService() {
        this.userLsit = new Map();
        this.roomLsit = [];
        this.gameLsit = [];
        this.socketLsit = new Map();
    }
    UserService.prototype.login = function (socket, name) {
        this.socketLsit[socket.id] = name;
        if (this.userLsit[name]) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.userLsit[name].isOnline = true;
            return "欢迎归来";
        }
        else {
            console.log(Date().toString().slice(15, 25), "新建", name);
            this.userLsit[name] = new user_1.User(name);
            this.roomLsit.push(this.userLsit[name]);
            return "欢迎加入";
        }
    };
    UserService.prototype.logout = function (socketId) {
        console.log(this.socketLsit[socketId]);
        if (this.socketLsit[socketId]) {
            this.userLsit[this.socketLsit[socketId]].isOnline = false;
            this.socketLsit.delete(socketId);
            return this.socketLsit[socketId] + "离线";
        }
        else {
            return "未登录用户离线";
        }
    };
    UserService.prototype.joinRoom = function (name) { };
    UserService.prototype.joinGame = function (name) { };
    UserService.prototype.upDataList = function () {
        return this.userLsit;
    };
    return UserService;
}());
exports.UserService = UserService;
