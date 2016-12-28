"use strict";
var Msg = (function () {
    function Msg(who, body, other) {
        this.who = who;
        this.body = body;
        this.other = other;
    }
    return Msg;
}());
exports.Msg = Msg;
