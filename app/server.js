"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as socketio from "socket.io";
// let io = socketio.listen(81);
var userService_1 = require("./userService");
var game_1 = require("./game");
var data_1 = require("./data");
var data_2 = require("./data");
var userList_1 = require("./userList");
exports.hList = new userList_1.Userlisthgn();
exports.userService = new userService_1.UserService();
exports.game = new game_1.Game();
var myEmitter_1 = require("./myEmitter");
var socketIdtoSocket = new Map();
var yaml = require("js-yaml");
var express = require('express');
var fs = require('fs');
var app = express();
var https = require('https');
var privateKey = fs.readFileSync('./app/yourkey.pem', 'utf8');
var certificate = fs.readFileSync('./app/yourcert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);
var SSLPORT = 88;
httpsServer.listen(SSLPORT, function () {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});
// let server = require('http').createServer(app);
var io = require('socket.io').listen(httpsServer);
// let io = require('socket.io').listen(88);
// let port = process.env.PORT || 8000;
// server.listen(port);
app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
io.on("connection", function (socket) {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket.emit("ok");
    socketIdtoSocket[socket.id] = socket;
    socket.on("disconnect", function () {
        // console.log(Date().toString().slice(15, 25), socket.id, "离线");
        socketIdtoSocket.delete(socket.id);
        var dataOut = new data_1.Data("logout");
        dataOut.other = exports.userService.logout(socket.id);
        dataOut.hList = exports.hList;
        myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
    });
    socket.on("system", function (data) {
        // console.log("system", data);
        io.emit(data.key);
        switch (data.type) {
            case "login":
                {
                    // console.log(Date().toString().slice(15, 25), "try to login", data.name);
                    exports.userService.login(socket, data);
                    break;
                }
            case "test":
                {
                    // console.log(Date().toString().slice(15, 25), "try to login", data.name);
                    socket.broadcast.emit('system', data);
                    console.log('测试消息', data);
                    break;
                }
            case "quickLogin":
                {
                    // console.log(Date().toString().slice(15, 25), "try to quickLogin", data.id);
                    exports.userService.quickLogin(socket, data);
                    break;
                }
            case "userSeat":
                {
                    // console.log(Date().toString().slice(15, 25), "尝试坐下", socket.id);
                    exports.userService.userSeat(socket.id);
                    break;
                }
            case "restart":
                {
                    console.log("restart");
                    // console.log(Date().toString().slice(15, 25), "尝试坐下", socket.id);
                    exports.game.restart();
                    break;
                }
            case "kick":
                {
                    console.log("kick", data.user);
                    // console.log(Date().toString().slice(15, 25), "尝试坐下", socket.id);
                    socketIdtoSocket[data.user.socketId].disconnect();
                    exports.userService.kick(data.user.name);
                    var kickdata = new data_1.Data("updata");
                    kickdata.playerList = exports.hList.playerList;
                    kickdata.hList = exports.hList;
                    myEmitter_1.myEmitter.emit("Send_Sth", kickdata);
                    break;
                }
            case "gamestart":
                {
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    exports.game.start(data.other);
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    exports.game.setPrm(data.user);
                    break;
                }
            case "player_vote":
                {
                    console.log(Date().toString().slice(15, 25), exports.userService.socketIdToUser[socket.id].name, "投票了");
                    exports.game.getVote(socket.id, data.voteRes);
                    break;
                }
            case "proSelect":
                {
                    exports.game.findPro(data.proX3List, data.pro);
                    break;
                }
            case "invPlayer":
                {
                    exports.game.invPlayer(data.target);
                    break;
                }
            case "toKill":
                {
                    exports.game.toKill(data.target);
                    break;
                }
            case "preSelect":
                {
                    exports.game.setPre(data.user);
                    break;
                }
            case "speak_end":
                {
                    myEmitter_1.myEmitter.emit("speak_end" + data.user.name);
                    break;
                }
            case "candidate":
                {
                    // console.log('candidate', data);
                    // console.log(userService.socketIdToUser[<string>data.toWho]);
                    data.toWho = exports.userService.socketIdToUser[data.toWho];
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    break;
                }
            case "desc":
                {
                    console.log('desc', data);
                    var k = data.toWho;
                    console.log('data.toWho', k);
                    console.log(exports.userService.socketIdToUser[k]);
                    data.toWho = exports.userService.socketIdToUser[data.toWho];
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    updatauser();
                    break;
                }
            case "call":
                {
                    console.log('来电请求', data);
                    console.log(exports.userService.socketIdToUser[data.data]);
                    exports.userService.socketIdToUser[socket.id].videoFree = false;
                    exports.userService.socketIdToUser[data.data].videoFree = false;
                    data.toWho = exports.userService.socketIdToUser[data.data];
                    data.data = socket.id;
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    updatauser();
                    break;
                }
            case "rtcend":
                {
                    console.log('结束通话', data);
                    console.log(exports.userService.socketIdToUser[data.data]);
                    exports.userService.socketIdToUser[socket.id].videoFree = true;
                    exports.userService.socketIdToUser[data.data].videoFree = true;
                    data.toWho = exports.userService.socketIdToUser[data.data];
                    console.log(data);
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    updatauser();
                    break;
                }
            case "answer":
                {
                    console.log('来电回应', data);
                    if (data.data) {
                        exports.userService.socketIdToUser[socket.id].videoFree = false;
                        exports.userService.socketIdToUser[data.toWho].videoFree = false;
                    }
                    else {
                        exports.userService.socketIdToUser[data.toWho].videoFree = true;
                        exports.userService.socketIdToUser[socket.id].videoFree = true;
                    }
                    socketIdtoSocket[data.toWho].emit("answer", data);
                    updatauser();
                    break;
                }
            case "veto_all":
                {
                    if (typeof data.other === "undefined") {
                        var dataOut = new data_1.Data("veto_all");
                        dataOut.msg = new data_2.Msg("playerCP", "总理向总统提出了否决全部法案的建议，等待总统决定", "prm_CP", "veto_all", "pre_CP_veto_all");
                        io.emit("system", dataOut);
                        exports.game.changestepWho(41);
                        break;
                    }
                    else {
                        if (data.other) {
                            console.log("同意否决");
                            var dataOut1 = new data_1.Data("通知");
                            dataOut1.other = data.other;
                            dataOut1.msg = new data_2.Msg("playerCP", "总统同意了总理全部否决的提议，本届政府失效", "prm_CP", "veto_all", "veto_all");
                            io.emit("system", dataOut1);
                            exports.game.veto_all();
                        }
                        else {
                            console.log("反对否决");
                            // todo  通知玩家
                            var dataOut = new data_1.Data("veto_all");
                            dataOut.other = data.other;
                            dataOut.msg = new data_2.Msg("playerCP", "总统反对了全部否却的提议，总理仍然要选择一张法案生效", "prm_CP", "veto_all", "not_veto_all");
                            io.emit("system", dataOut);
                            exports.game.changestepWho(51);
                        }
                    }
                    break;
                }
            // 普通文字消息
            case "sendMsg":
                {
                    // console.log(Date().toString().slice(15, 25), socket.id, "发言");
                    exports.game.speaksth(data.msg.body);
                    // let dataOut = new MsgData(userService.socketIdToUser[socket.id]);
                    // dataOut.msgFrom = userService.socketIdToUser[socket.id];
                    // dataOut.msg = data.msg;
                    // io.emit("system", dataOut);
                    break;
                }
            // 测试文字消息
            case "testMsg":
                {
                    console.log(socket.id, "发言", data);
                    // let dataOut = new MsgData(userService.socketIdToUser[socket.id]);
                    // dataOut.msgFrom = userService.socketIdToUser[socket.id];
                    // dataOut.msg = data.msg;
                    // io.emit("system", dataOut);
                    io.emit('system', data);
                    break;
                }
            default:
                console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
        }
    });
});
myEmitter_1.myEmitter.on("speak_start", function () {
    // 通知所有玩家 进入发言状态
    speakAll();
    function speakAll() {
        return __awaiter(this, void 0, void 0, function () {
            var data, preNo, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        exports.game.speakstart(exports.game.pre);
                        console.log("speak_start");
                        data = new data_1.Data("speak_start");
                        // data.msg = new Msg("system", "玩家顺序发言开始，请切换到“发言界面查看发言”");
                        myEmitter_1.myEmitter.emit("Send_Sth", data);
                        return [4 /*yield*/, speakPlease(exports.game.pre)];
                    case 1:
                        _a.sent();
                        exports.game.speakend();
                        myEmitter_1.myEmitter.emit("Send_Sth", new data_1.Data("someone_speak_end"));
                        if (!(exports.game.prm && exports.game.prm.isSurvival)) return [3 /*break*/, 3];
                        exports.game.speakstart(exports.game.prm);
                        return [4 /*yield*/, speakPlease(exports.game.prm)];
                    case 2:
                        _a.sent();
                        exports.game.speakend();
                        myEmitter_1.myEmitter.emit("Send_Sth", new data_1.Data("someone_speak_end"));
                        _a.label = 3;
                    case 3:
                        preNo = exports.hList.playerList.indexOf(exports.game.pre);
                        console.log("总统编号", preNo);
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < exports.hList.playerList.length)) return [3 /*break*/, 8];
                        if (!(!exports.hList.playerList[preNo].isPre && !exports.hList.playerList[preNo].isPrm && exports.hList.playerList[preNo].isSurvival)) return [3 /*break*/, 6];
                        exports.game.speakstart(exports.hList.playerList[preNo]);
                        return [4 /*yield*/, speakPlease(exports.hList.playerList[preNo])];
                    case 5:
                        _a.sent();
                        exports.game.speakend();
                        myEmitter_1.myEmitter.emit("Send_Sth", new data_1.Data("someone_speak_end"));
                        _a.label = 6;
                    case 6:
                        if (preNo === exports.hList.playerList.length - 1) {
                            preNo = 0;
                        }
                        else {
                            preNo++;
                        }
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 4];
                    case 8:
                        myEmitter_1.myEmitter.emit("speak_endAll");
                        return [2 /*return*/];
                }
            });
        });
    }
    function speakPlease(who) {
        var data = new data_1.Data("newPlayerSpeak");
        data.speakTime = exports.game.speakTime;
        data.whoIsSpeaking = who;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        console.log("发言消息发送", who.name);
        return new Promise(function (resolve) {
            var this_timer = setTimeout(function () {
                myEmitter_1.myEmitter.removeListener("speak_end", function () {
                });
                resolve("时间到,发言结束");
            }, exports.game.speakTime * 1000);
            myEmitter_1.myEmitter.once("speak_end" + who.name, function () {
                clearTimeout(this_timer);
                resolve("对方主动结束发言");
            });
        });
    }
});
function updatauser() {
    var dataOut = new data_1.Data("updata");
    dataOut.hList = exports.hList;
    myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
}
myEmitter_1.myEmitter.on("Push_msg", function (user, msg) {
    var data = new data_1.Data("Push_msg");
    data.msg = msg;
    socketIdtoSocket[user.socketId].emit("system", data);
});
myEmitter_1.myEmitter.on("Updata_msg", function (user, msg) {
    var data = new data_1.Data("Updata_msg");
    data.msg = msg;
    socketIdtoSocket[user.socketId].emit("system", data);
});
myEmitter_1.myEmitter.on("show_msg", function (user, msgList) {
    var data = new data_1.Data("show_msg");
    data.msgList = msgList;
    socketIdtoSocket[user.socketId].emit("system", data);
});
myEmitter_1.myEmitter.on("Send_Sth", function (data) {
    if (typeof data.toWho === "undefined") {
        console.log("发给所有人", data.type);
        data.toWho = exports.hList.userList;
    }
    // console.log(data);
    if (Array.isArray(data.toWho)) {
        for (var _i = 0, _a = data.toWho; _i < _a.length; _i++) {
            var v_toWho = _a[_i];
            if (typeof data.hList !== "undefined") {
                exports.hList.yourself = v_toWho;
                data.hList = yaml.safeDump(exports.hList);
            }
            socketIdtoSocket[v_toWho.socketId].emit("system", data);
        }
    }
    else {
        if (typeof data.hList !== "undefined") {
            data.hList.yourself = data.toWho;
            data.hList = yaml.safeDump(data.hList);
        }
        socketIdtoSocket[data.toWho.socketId].emit("system", data);
    }
});
//
// function send(data: Data) {
//   if (typeof data.toWho === "undefined") {
//     console.log("发给所有人", data.type);
//     io.emit("system", data);
//     return;
//   }
//   if (Array.isArray(data.toWho)) {
//     for (let v_toWho of data.toWho) {
//       socketIdtoSocket[v_toWho.socketId].emit("system", data);
//     }
//   } else {
//     socketIdtoSocket[data.toWho.socketId].emit("system", data);
//   }
// }
