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
exports.userLsitTestdata = [
    new user_1.User("传说中的第1人"),
    new user_1.User("我是本届总统"),
    new user_1.User("上届总理"),
    new user_1.User("上届总统"),
    new user_1.User("希特勒"),
    new user_1.User("-( ゜- ゜)つロ乾杯~"),
    new user_1.User("这个人的名字有十个字"),
    new user_1.User("真·皇冠鸟"),
    new user_1.User("这人被枪毙了"),
    new user_1.User("第八人"),
    new user_1.User("阿依吐拉公主"),
];
function getdate() {
    exports.userLsitTestdata[1].isPre = true;
    exports.userLsitTestdata[2].isLastPrm = true;
    exports.userLsitTestdata[3].isLastPre = true;
    exports.userLsitTestdata[8].isSurvival = false;
    exports.userLsitTestdata[4].isHitler = true;
    exports.userLsitTestdata[7].isFascist = true;
    exports.userLsitTestdata[8].isFascist = true;
    return exports.userLsitTestdata;
}
exports.getdate = getdate;
