"use strict";
var user_1 = require("./user");
var server_1 = require("./server");
var myEmitter_1 = require("./myEmitter");
var MsgServices = (function () {
    //
    // msgListAll = new Array<any>(); // 总发言记录
    // msgListNow = new Array<any>(); // 当前发言记录
    // newPlayerSpeak(player: User) {
    //   let tmp = new Array<any>();
    //   tmp.push(player);
    //   this.msgListAll.push(tmp);
    //   this.msgListNow = tmp;
    // }
    function MsgServices() {
        this.allPlayerMsgList = [];
        this.noToUser = [];
        this.allPlayerMsgList = [];
        this.allPlayerMsgList.push(new Array());
        this.noToUser = [];
        this.noToUser.push(new user_1.User("x"));
        for (var i = 0; i < server_1.hList.playerList.length; i++) {
            this.allPlayerMsgList.push(new Array());
            this.noToUser.push(server_1.hList.playerList[i]);
        }
    }
    MsgServices.prototype.pushAll = function (msg, user1, user2, user3) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
                this.allPlayerMsgList[i].push(JSON.parse(JSON.stringify(msg)));
                if (i) {
                    myEmitter_1.myEmitter.emit("Push_msg", this.noToUser[i], msg);
                }
            }
        }
        for (var i = 0; i < server_1.hList.userList.length; i++) {
            if (server_1.hList.userList[i].seatNo === 0) {
                myEmitter_1.myEmitter.emit("Push_msg", server_1.hList.userList[i], msg);
            }
        }
    };
    MsgServices.prototype.changestepAll = function (n, user1, user2, user3) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
                var msg_1 = this.allPlayerMsgList[i][this.allPlayerMsgList[i].length - 1];
                msg_1.step = n;
                if (i) {
                    myEmitter_1.myEmitter.emit("Updata_msg", this.noToUser[i], msg_1);
                }
            }
        }
        var msg = this.allPlayerMsgList[0][this.allPlayerMsgList[0].length - 1];
        for (var i = 0; i < server_1.hList.userList.length; i++) {
            if (server_1.hList.userList[i].seatNo === 0) {
                myEmitter_1.myEmitter.emit("Updata_msg", server_1.hList.userList[i], msg);
            }
        }
    };
    MsgServices.prototype.updataAll = function (msg, user1, user2, user3) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
                this.allPlayerMsgList[i].pop();
                this.allPlayerMsgList[i].push(JSON.parse(JSON.stringify(msg)));
                if (i) {
                    myEmitter_1.myEmitter.emit("Updata_msg", this.noToUser[i], msg);
                }
            }
        }
        for (var i = 0; i < server_1.hList.userList.length; i++) {
            if (server_1.hList.userList[i].seatNo === 0) {
                myEmitter_1.myEmitter.emit("Updata_msg", server_1.hList.userList[i], msg);
            }
        }
    };
    MsgServices.prototype.pushWho = function (who, msg) {
        this.allPlayerMsgList[who.seatNo].push(JSON.parse(JSON.stringify(msg)));
        myEmitter_1.myEmitter.emit("Push_msg", who, msg);
    };
    MsgServices.prototype.updataWho = function (who, msg) {
        this.allPlayerMsgList[who.seatNo].pop();
        this.allPlayerMsgList[who.seatNo].push(JSON.parse(JSON.stringify(msg)));
        myEmitter_1.myEmitter.emit("Updata_msg", who, msg);
    };
    MsgServices.prototype.updataspk = function (n, msg) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            var thismsg = this.allPlayerMsgList[i][this.allPlayerMsgList[i].length - 1];
            thismsg.step = n;
            if (msg) {
                var tmplist = msg.split(/\r\n|\r|\n/g);
                for (var i_1 = 0; i_1 < tmplist.length; i_1++) {
                    thismsg.msgList.push(tmplist[i_1]);
                }
            }
            if (i) {
                myEmitter_1.myEmitter.emit("Updata_msg", this.noToUser[i], thismsg);
            }
        }
        for (var i = 0; i < server_1.hList.userList.length; i++) {
            if (server_1.hList.userList[i].seatNo === 0) {
                myEmitter_1.myEmitter.emit("Updata_msg", server_1.hList.userList[i], this.allPlayerMsgList[0][this.allPlayerMsgList[0].length - 1]);
            }
        }
    };
    MsgServices.prototype.changestepWho = function (who, n) {
        var msg = this.allPlayerMsgList[who.seatNo][this.allPlayerMsgList[who.seatNo].length - 1];
        msg.step = n;
        myEmitter_1.myEmitter.emit("Updata_msg", who, msg);
    };
    MsgServices.prototype.showWho = function (who) {
        var msgList = this.allPlayerMsgList[who.seatNo];
        myEmitter_1.myEmitter.emit("show_msg", who, msgList);
    };
    MsgServices.prototype.showAll = function () { };
    return MsgServices;
}());
exports.MsgServices = MsgServices;
