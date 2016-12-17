"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var data_1 = require("./data");
var MsgData = (function (_super) {
    __extends(MsgData, _super);
    function MsgData() {
        var _this = _super.call(this) || this;
        _this.type = "msg";
        return _this;
    }
    return MsgData;
}(data_1.Data));
exports.MsgData = MsgData;
