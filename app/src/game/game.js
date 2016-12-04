"use strict";
var server_1 = require("../server");
var Game = (function () {
    // 游戏状态，是否开始，影响到能否加入游戏等
    function Game() {
        this.userList = server_1.userService.userLsit; // 加入本次游戏的玩家列表，主要用于消息发送
        this.skillList = []; // 技能列表
        this.proIndex = 16; // 牌堆顶
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
        this.failTimes = 0; // 政府组件失败次数
        // 法案牌生成
        for (var i = 0; i <= 16; i++) {
            this.proList[i] = i;
        }
    }
    Game.prototype.start = function () {
        if (this.userList.length >= 5) {
            console.log('开始人数：', this.userList.length);
        }
        else {
            console.log('人数不足：', this.userList.length);
        }
    };
    Game.prototype.setPlayer = function () { };
    Game.prototype.setGame = function () { };
    Game.prototype.setPro = function () { };
    Game.prototype.Shuffle = function () { };
    Game.prototype.setPre = function () { };
    Game.prototype.setPrm = function () { };
    Game.prototype.effPro = function () { };
    Game.prototype.vote = function () { };
    Game.prototype.preSelect = function () { };
    Game.prototype.prmSelect = function () { };
    Game.prototype.proSelect = function () { };
    Game.prototype.tmp = function () { };
    Game.prototype.back = function () { };
    Game.prototype.gameOver = function () { };
    return Game;
}());
exports.Game = Game;
