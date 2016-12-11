"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var data_1 = require("./data");
var DataUser = (function (_super) {
    __extends(DataUser, _super);
    function DataUser() {
        var _this = _super.apply(this, arguments) || this;
        // 游戏数据
        _this.started = false; // 游戏是否开始
        // 法案牌堆相关
        _this.proIndex = 16; // 牌堆顶
        _this.proList = new Array(); // 法案牌堆
        // 游戏进程
        _this.failTimes = 0; // 政府组件失败次数
        _this.proEffBlue = 0; // 蓝法案生效数
        _this.proEffRed = 0; // 红法案生效数
        return _this;
    }
    DataUser.prototype.super = function () { };
    return DataUser;
}(data_1.Data));
exports.DataUser = DataUser;
