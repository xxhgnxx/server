"use strict";
var Data = (function () {
    function Data() {
        this.proList = new Array(); // 法案牌堆
        // 游戏进程
        this.failTimes = 0; // 政府组件失败次数
        this.proEffBlue = 0; // 蓝法案生效数
        this.proEffRed = 0; // 红法案生效数
    }
    return Data;
}());
exports.Data = Data;
