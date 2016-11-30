"use strict";
var user_1 = require("./user");
var UserService = (function () {
    function UserService() {
        this.userLsit = [];
        this.admin = new user_1.User("admin");
        this.roomLsit = [];
        this.gameLsit = [];
        this.socketLsit = [];
        this.userLsit[this.admin.name] = this.admin;
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
            return "欢迎加入";
        }
    };
    UserService.prototype.logout = function (name) {
        console.log(Date().toString().slice(15, 25), "离线", name);
        this.userLsit[name].isOnline = false;
        return "欢迎归来";
    };
    UserService.prototype.joinRoom = function (name) { };
    UserService.prototype.joinGame = function (name) { };
    UserService.prototype.upDataList = function () {
        return this.userLsit;
    };
    return UserService;
}());
exports.UserService = UserService;
