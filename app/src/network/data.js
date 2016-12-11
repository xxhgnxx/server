"use strict";
var Data = (function () {
    function Data(userService) {
        // 游戏数据
        this.started = false; // 游戏是否开始
        // 法案牌堆相关
        this.proIndex = 16; // 牌堆顶
        this.proList = new Array(); // 法案牌堆
        // 游戏进程
        this.failTimes = 0; // 政府组件失败次数
        this.proEffBlue = 0; // 蓝法案生效数
        this.proEffRed = 0; // 红法案生效数
        this.userList = userService.userList;
    }
    return Data;
}());
exports.Data = Data;
