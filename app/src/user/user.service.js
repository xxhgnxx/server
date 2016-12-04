"use strict";
var user_1 = require("./user");
var server_1 = require("../server");
var UserService = (function () {
    function UserService() {
        this.userLsit = new Array();
        this.gameLsit = new Array();
        this.socketIdToUser = new Map();
    }
    UserService.prototype.login = function (socketId, name) {
        var me = this.userLsit.filter(function (t) { return t.name === name; })[0];
        if (me) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.socketIdToUser[socketId] = me;
            this.socketIdToUser[socketId].isOnline = true;
            return this.socketIdToUser[socketId].name + "欢迎归来";
        }
        else {
            console.log(Date().toString().slice(15, 25), "用户新加入", name);
            this.socketIdToUser[socketId] = new user_1.User(name);
            this.userLsit.push(this.socketIdToUser[socketId]);
            return "欢迎加入";
        }
    };
    UserService.prototype.logout = function (socketId) {
        if (this.socketIdToUser[socketId]) {
            this.socketIdToUser[socketId].isOnline = false;
            this.socketIdToUser.delete(socketId);
            console.log(Date().toString().slice(15, 25), this.socketIdToUser[socketId].name, "离线");
            return this.socketIdToUser[socketId].name + "离线";
        }
        else {
            console.log(Date().toString().slice(15, 25), "未登录用户离线");
            return "未登录用户离线";
        }
    };
    UserService.prototype.userSeat = function (socketId, name) {
        if (this.socketIdToUser[socketId].isSeat) {
            this.socketIdToUser[socketId].isSeat = false;
            server_1.game.userList.splice(server_1.game.userList.indexOf(this.socketIdToUser[socketId]), 1);
            return "站起来" + name;
        }
        else {
            this.socketIdToUser[socketId].isSeat = true;
            server_1.game.userList.push(this.socketIdToUser[socketId]);
            return "坐下了" + name;
        }
    };
    UserService.prototype.joinRoom = function (name) { };
    UserService.prototype.joinGame = function (name) { };
    return UserService;
}());
exports.UserService = UserService;
