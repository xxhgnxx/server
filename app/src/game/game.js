"use strict";
var Game = (function () {
    function Game(name) {
        this.theGame = null; // 游戏状态，是否开始，影响到能否加入游戏等
        this.skillList = []; // 技能列表
        this.proIndex = 16; // 牌堆顶
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0;
        this.failTimes = 0; // 政府组件失败次数
        // 法案牌生成
        for (var i = 0; i <= 16; i++) {
            this.proList[i] = i;
        }
    }
    return Game;
}());
exports.Game = Game;
