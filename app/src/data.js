"use strict";
var Data = (function () {
    function Data(type, toWho) {
        this.type = type;
        this.toWho = toWho;
    }
    return Data;
}());
exports.Data = Data;
var MsgData = (function () {
    function MsgData(whoIsSpeaking) {
        this.whoIsSpeaking = whoIsSpeaking;
        this.type = "some_one_speak_sth";
    }
    return MsgData;
}());
exports.MsgData = MsgData;
var Msg = (function () {
    function Msg(who, body, other) {
        this.who = who;
        this.body = body;
        this.other = other;
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
