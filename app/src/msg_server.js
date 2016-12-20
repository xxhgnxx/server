"use strict";
var MsgServices = (function () {
    function MsgServices() {
        this.msgListAll = new Array(); // 总发言记录
        this.msgListNow = new Array(); // 当前发言记录
    }
    MsgServices.prototype.newPlayerSpeak = function (player) {
        var tmp = new Array();
        tmp.push(player);
        this.msgListAll.push(tmp);
        this.msgListNow = tmp;
    };
    return MsgServices;
}());
exports.MsgServices = MsgServices;
