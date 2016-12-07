"use strict";
/**
 * 网络服务socket：socket链接,systemFunc：消息处理服务，type：类型“server，client”
 */
var NetworkSocket = (function () {
    function NetworkSocket() {
    }
    NetworkSocket.prototype.start = function (socket, systemFunc, type) {
        var _this = this;
        this.socket = socket;
        if (type === "server") {
            this.socket.on("connection", function (socket) {
                console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
                _this.socket.on("system", function (data) {
                    _this.socket.emit(data.key);
                    systemFunc(data);
                });
            });
            socket.on("disconnect", function () {
                console.log(Date().toString().slice(15, 25), socket.id, "离线");
                systemFunc(socket.id);
            });
        }
        else {
            this.socket.on("system", function (data) {
                _this.socket.emit(data.key);
                systemFunc(data);
            });
        }
    };
    /**
     * 请求器，data：消息内容，cb：后续动作入口
     */
    NetworkSocket.prototype.send = function (data, cb) {
        data.key = idgen();
        this.socket.emit("system", data);
        var timeout = setTimeout(function () {
            cb(false);
        }, 3000);
        this.socket.on(data.key, function () {
            clearTimeout(timeout);
            cb(true);
        });
    };
    return NetworkSocket;
}());
exports.NetworkSocket = NetworkSocket;
/**
 * 随机字符串
 */
function idgen() {
    var _printable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text = "";
    for (var i = 0; i < 22; i++) {
        text += _printable.charAt(Math.floor(Math.random() * _printable.length));
    }
    return text;
}
