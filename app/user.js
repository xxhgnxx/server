"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 用户 数据结构
var User = (function () {
    function User(name) {
        this.socketId = "x";
        this.isOnline = true;
        this.isSurvival = true;
        this.isSeat = false;
        this.seatNo = 0;
        this.videoFree = true;
        this.isLastPre = false;
        this.isLastPrm = false;
        this.isPre = false;
        this.isPrm = false;
        this.isTmpPrm = false;
        this.isHitler = false;
        this.isFascist = false;
        this.role = "x";
        this.canBeSelect = true;
        this.name = name;
        this.headPic = Math.round(Math.random() * 12);
    }
    return User;
}());
exports.User = User;
