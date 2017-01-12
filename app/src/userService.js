"use strict";
var user_1 = require("./user");
var server_1 = require("./server");
var data_1 = require("./data");
var server_2 = require("./server");
var myEmitter_1 = require("./myEmitter");
var UserService = (function () {
    function UserService() {
        this.socketIdToUser = new Map();
        this.NameToPass = new Map();
        this.idToUsername = new Map();
        this.usernameToId = new Map();
    }
    UserService.prototype.login = function (socket, data) {
        var me = server_2.hList.userList.filter(function (t) { return t.name === data.name; })[0];
        if (me) {
            console.log("用户已存在");
            if (me.isOnline) {
                var tmpuser = new user_1.User(data.name);
                tmpuser.socketId = socket.id;
                var dataout = new data_1.Data("Login_fail", tmpuser);
                dataout.login = false;
                dataout.toWho = tmpuser;
                dataout.other = "该用户在线";
                myEmitter_1.myEmitter.emit("Send_Sth", dataout);
                return;
            }
            if (data.pass === this.NameToPass[data.name]) {
                console.log("密码正确");
                console.log(Date().toString().slice(15, 25), "返回", data.name);
                this.idToUsername.delete(this.usernameToId[me.name]);
                var id = this.idgen();
                this.idToUsername[id] = me.name;
                this.usernameToId[me.name] = id;
                this.socketIdToUser[socket.id] = me;
                me.isOnline = true;
                me.socketId = socket.id;
                var dataout = new data_1.Data("loginSuccess", me);
                dataout.id = id;
                dataout.login = true;
                dataout.socketId = socket.id;
                dataout.yourself = me;
                dataout.toWho = me;
                dataout.hList = server_2.hList;
                myEmitter_1.myEmitter.emit("Send_Sth", dataout);
                var dataout2 = new data_1.Data("updata");
                dataout2.hList = server_2.hList;
                dataout2.playerList = server_2.hList.playerList;
                myEmitter_1.myEmitter.emit("Send_Sth", dataout2);
                this.welcomeback(me);
            }
            else {
                console.log("密码错误");
                var tmpuser = new user_1.User(data.name);
                tmpuser.socketId = socket.id;
                var dataout = new data_1.Data("Login_fail", tmpuser);
                dataout.login = false;
                dataout.toWho = tmpuser;
                dataout.other = "密码错误";
                myEmitter_1.myEmitter.emit("Send_Sth", dataout);
            }
        }
        else {
            console.log(Date().toString().slice(15, 25), "用户新加入", data.name);
            this.socketIdToUser[socket.id] = new user_1.User(data.name);
            this.socketIdToUser[socket.id].socketId = socket.id;
            this.NameToPass[data.name] = data.pass;
            var id = this.idgen();
            this.idToUsername[id] = this.socketIdToUser[socket.id].name;
            this.usernameToId[this.socketIdToUser[socket.id].name] = id;
            server_2.hList.userList.push(this.socketIdToUser[socket.id]);
            // let tmp = this.userSeat(socket.id); // 测试用
            var dataout = new data_1.Data("loginSuccess", this.socketIdToUser[socket.id]);
            dataout.id = id;
            dataout.login = true;
            dataout.socketId = socket.id;
            dataout.yourself = this.socketIdToUser[socket.id];
            dataout.toWho = this.socketIdToUser[socket.id];
            dataout.hList = server_2.hList;
            myEmitter_1.myEmitter.emit("Send_Sth", dataout);
            // ------test 测试用
            // this.socketIdToUser[socket.id].isSeat = true;
            // hList.playerList.push(this.socketIdToUser[socket.id]);
            // console.log("坐下了" + this.socketIdToUser[socket.id].name);
            // ------test 测试用
            var dataout2 = new data_1.Data("updata");
            dataout2.hList = server_2.hList;
            myEmitter_1.myEmitter.emit("Send_Sth", dataout2);
            this.welcomeback(this.socketIdToUser[socket.id]);
        }
    };
    UserService.prototype.quickLogin = function (socket, data) {
        var _this = this;
        // todo  登陆成功后，删除以前的id
        if (this.idToUsername[data.id]) {
            console.log("指纹匹配成功");
            var me = server_2.hList.userList.filter(function (t) { return t.name === _this.idToUsername[data.id]; })[0];
            this.socketIdToUser.delete(data.id);
            var id = this.idgen();
            this.idToUsername[id] = me.name;
            this.socketIdToUser[socket.id] = me;
            me.isOnline = true;
            me.socketId = socket.id;
            this.idToUsername.delete(this.usernameToId[me.name]);
            this.usernameToId[me.name] = id;
            var dataout = new data_1.Data("quickloginSuccess", me);
            dataout.id = id;
            dataout.login = true;
            dataout.socketId = socket.id;
            dataout.yourself = me;
            dataout.hList = server_2.hList;
            myEmitter_1.myEmitter.emit("Send_Sth", dataout);
            var dataOut = new data_1.Data("updata");
            dataOut.hList = server_2.hList;
            myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
            this.welcomeback(me);
        }
        else {
            console.log("指纹匹配失败");
            var tmpuser = new user_1.User(data.name);
            tmpuser.socketId = socket.id;
            var dataout = new data_1.Data("quickLogin_fail", tmpuser);
            dataout.login = false;
            myEmitter_1.myEmitter.emit("Send_Sth", dataout);
        }
    };
    UserService.prototype.logout = function (socketId) {
        if (this.socketIdToUser[socketId]) {
            this.socketIdToUser[socketId].isOnline = false;
            if (!server_1.game.started) {
                console.log("游戏没开始，从playerlist中剔除该用户");
                this.socketIdToUser[socketId].isSeat = false;
                var tmpuser = server_2.hList.playerList.indexOf(this.socketIdToUser[socketId]);
                if (tmpuser !== -1) {
                    server_2.hList.playerList.splice(tmpuser, 1);
                }
            }
            // 测试代码---------------
            // this.socketIdToUser[socketId].isSeat = false;
            // hList.playerList.splice(hList.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            // 测试代码---------------
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
            server_2.hList.playerList.splice(server_2.hList.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            console.log("站起来" + this.socketIdToUser[socketId].name);
        }
        else {
            this.socketIdToUser[socketId].isSeat = true;
            server_2.hList.playerList.push(this.socketIdToUser[socketId]);
            console.log("坐下了" + this.socketIdToUser[socketId].name);
        }
        var data = new data_1.Data("updata");
        data.playerList = server_2.hList.playerList;
        data.hList = server_2.hList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    UserService.prototype.welcomeback = function (you) {
        server_1.game.welcomeback(you);
    };
    UserService.prototype.joinRoom = function (name) { };
    UserService.prototype.joinGame = function (name) { };
    /**
     * 随机字符串
     */
    UserService.prototype.idgen = function () {
        var _printable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var text = "";
        for (var i = 0; i < 22; i++) {
            text += _printable.charAt(Math.floor(Math.random() * _printable.length));
        }
        return text;
    };
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
