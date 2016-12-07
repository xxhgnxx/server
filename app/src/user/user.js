"use strict";
var User = (function () {
    function User(name) {
        this.isOnline = true;
        this.isSurvival = true;
        this.isSeat = false;
        this.seatNo = 0;
        this.isLastPre = false;
        this.isLastPrm = false;
        this.isPre = false;
        this.isPrm = false;
        this.isHitler = false;
        this.isFascist = false;
        this.role = "x";
        this.name = name;
    }
    User.prototype.userSetNo = function (n) {
        this.seatNo = n;
        console.log(this.name, "坐在了", n, "号座位上");
    };
    User.prototype.userSeat = function () {
        this.isSeat = !this.isSeat;
        console.log(this.name, this.isSeat ? "坐下了" : "离开了座位");
    };
    // userOnline() {
    //     this.isOnline = !this.isOnline;
    //     console.log(this.name, this.isOnline ? "上线了" : "离线了");
    // }
    User.prototype.userSurvival = function () {
        this.isSurvival = !this.isSurvival;
        console.log(this.name, this.isOnline ? "挂了" : "复活了？！");
    };
    return User;
}());
exports.User = User;
