"use strict";
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
        this.noToUser = [];
        for (var i = 0; i < server_1.hList.playerList.length; i++) {
            this.allPlayerMsgList.push(new Array());
            this.noToUser.push(server_1.hList.playerList[i]);
        }
    }
    MsgServices.prototype.pushAll = function (msg, user1, user2, user3) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
                this.allPlayerMsgList[i].push(JSON.parse(JSON.stringify(msg)));
                myEmitter_1.myEmitter.emit("Push_msg", this.noToUser[i], msg);
            }
        }
    };
    MsgServices.prototype.pushWho = function (who, msg) {
        this.allPlayerMsgList[who.seatNo - 1].push(JSON.parse(JSON.stringify(msg)));
        myEmitter_1.myEmitter.emit("Push_msg", who, msg);
    };
    MsgServices.prototype.updataWho = function (who, msg) {
        this.allPlayerMsgList[who.seatNo - 1].pop();
        this.allPlayerMsgList[who.seatNo - 1].push(JSON.parse(JSON.stringify(msg)));
        myEmitter_1.myEmitter.emit("Updata_msg", who, msg);
    };
    MsgServices.prototype.changestepAll = function (n, user1, user2, user3) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
                var msg = this.allPlayerMsgList[i][this.allPlayerMsgList[i].length - 1];
                msg.step = n;
                myEmitter_1.myEmitter.emit("Updata_msg", this.noToUser[i], msg);
            }
        }
    };
    MsgServices.prototype.updataspk = function (n, msg) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            var thismsg = this.allPlayerMsgList[i][this.allPlayerMsgList[i].length - 1];
            thismsg.step = n;
            if (msg) {
                thismsg.msgList.push(msg);
            }
            myEmitter_1.myEmitter.emit("Updata_msg", this.noToUser[i], thismsg);
        }
    };
    MsgServices.prototype.changestepWho = function (who, n) {
        var msg = this.allPlayerMsgList[who.seatNo - 1][this.allPlayerMsgList[who.seatNo - 1].length - 1];
        msg.step = n;
        myEmitter_1.myEmitter.emit("Updata_msg", who, msg);
    };
    MsgServices.prototype.updataAll = function (msg, user1, user2, user3) {
        for (var i = 0; i < this.allPlayerMsgList.length; i++) {
            if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
                this.allPlayerMsgList[i].pop();
                this.allPlayerMsgList[i].push(JSON.parse(JSON.stringify(msg)));
                myEmitter_1.myEmitter.emit("Updata_msg", this.noToUser[i], msg);
            }
        }
    };
    return MsgServices;
}());
exports.MsgServices = MsgServices;
