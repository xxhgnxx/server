"use strict";
var user_1 = require("./user");
var server_1 = require("../server");
var UserService = (function () {
    function UserService() {
        this.userList = new Array();
        this.gamelist = new Array();
        this.socketIdToUser = new Map();
    }
    UserService.prototype.login = function (socket, name) {
        var me = this.userList.filter(function (t) { return t.name === name; })[0];
        if (me) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.socketIdToUser[socket.id] = me;
            this.socketIdToUser[socket.id].isOnline = true;
            this.socketIdToUser[socket.id].socketId = socket.id;
            return this.socketIdToUser[socket.id].name + "欢迎归来";
        }
        else {
            console.log(Date().toString().slice(15, 25), "用户新加入", name);
            this.socketIdToUser[socket.id] = new user_1.User(name);
            this.socketIdToUser[socket.id].socketId = socket.id;
            this.userList.push(this.socketIdToUser[socket.id]);
            var tmp = this.userSeat(socket.id); // 测试用
            return "欢迎加入";
        }
    };
    UserService.prototype.logout = function (socketId) {
        if (this.socketIdToUser[socketId]) {
            this.socketIdToUser[socketId].isOnline = false;
            if (!server_1.game.started) {
                this.socketIdToUser[socketId].isSeat = false;
                server_1.game.playerList.splice(server_1.game.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            }
            this.socketIdToUser.delete(socketId);
            console.log(Date().toString().slice(15, 25), this.socketIdToUser[socketId].name, "离线");
            return this.socketIdToUser[socketId].name + "离线";
        }
        else {
            console.log(Date().toString().slice(15, 25), "未登录用户离线");
            return "未登录用户离线";
        }
    };
    UserService.prototype.userSeat = function (socketId) {
        if (this.socketIdToUser[socketId].isSeat) {
            this.socketIdToUser[socketId].isSeat = false;
            server_1.game.playerList.splice(server_1.game.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            return "站起来" + this.socketIdToUser[socketId].name;
        }
        else {
            this.socketIdToUser[socketId].isSeat = true;
            server_1.game.playerList.push(this.socketIdToUser[socketId]);
            return "坐下了" + this.socketIdToUser[socketId].name;
        }
    };
    UserService.prototype.joinRoom = function (name) { };
    UserService.prototype.joinGame = function (name) { };
    return UserService;
}());
exports.UserService = UserService;
// 测试数据
exports.userListTestdata = [
    new user_1.User("传说中的第1人"),
    new user_1.User("我是本届总统"),
    new user_1.User("玩家K"),
    new user_1.User("微波史密斯"),
    new user_1.User("希特勒"),
    new user_1.User("-( ゜- ゜)つロ乾杯~"),
    new user_1.User("这个人的名字有十个字"),
    new user_1.User("真·皇冠鸟"),
    new user_1.User("这人被枪毙了"),
    new user_1.User("第八人"),
    new user_1.User("阿依吐拉公主"),
];
function getdate() {
    exports.userListTestdata[8].isSurvival = false;
    exports.userListTestdata[4].isOnline = false;
    return exports.userListTestdata;
}
exports.getdate = getdate;
