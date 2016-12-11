"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var data_1 = require("./data");
var DataOut = (function (_super) {
    __extends(DataOut, _super);
    function DataOut() {
        return _super.apply(this, arguments) || this;
    }
    DataOut.prototype.super = function (userService) { this.userList = userService.userList; };
    return DataOut;
}(data_1.Data));
exports.DataOut = DataOut;
