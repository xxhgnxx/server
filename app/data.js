"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Data = (function () {
    function Data(type, toWho) {
        this.type = type;
        this.toWho = toWho;
    }
    return Data;
}());
exports.Data = Data;
var Msg = (function () {
    function Msg(who, body, other, other1, other2) {
        this.who = who;
        this.body = body;
        this.other = other;
        this.other1 = other1;
        this.other2 = other2;
        if (typeof who === "string") {
            this.type = who;
        }
        else {
            this.type = "playerMsg";
        }
    }
    return Msg;
}());
exports.Msg = Msg;
