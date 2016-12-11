"use strict";
var Network = (function () {
    function Network() {
        this.io = require("socket.io").listen(81);
        io.on("connection", function (socket) {
            console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
            socket.on("disconnect", function () {
                console.log(Date().toString().slice(15, 25), socket.id, "离线");
                socketIdtoSocket.delete(socket.id);
                var dataOut = new Data();
                dataOut.type = "logout";
                dataOut.msg = userService.logout(socket.id);
                io.emit("system", dataOut);
            });
            socket.on("system", function (data) {
                console.log("收到客户端发来的system请求", data.type, socket.id);
                io.emit(data.key);
                switch (data.type) {
                    case "login":
                        {
                            console.log(Date().toString().slice(15, 25), "login", data.name);
                            socketIdtoSocket[socket.id] = socket;
                            var dataOut = new Data();
                            dataOut.type = "loginSuccess";
                            dataOut.msg = userService.login(socket, data.name);
                            dataOut.user = userService.socketIdToUser[socket.id];
                            dataOut.socketId = socket.id;
                            send(dataOut.user, dataOut);
                            break;
                        }
                    case "userSeat":
                        {
                            console.log(Date().toString().slice(15, 25), "尝试坐下", data.name);
                            var dataOut = new Data();
                            dataOut.msg = userService.userSeat(socket.id);
                            dataOut.type = "userSeat";
                            dataOut.user = userService.socketIdToUser[socket.id];
                            io.emit("system", dataOut);
                            break;
                        }
                    case "gamestart":
                        {
                            ////////////////////// 未完成功能
                            console.log(Date().toString().slice(15, 25), "游戏开始");
                            game.start();
                            var dataOut = new Data();
                            dataOut.playerList = game.playerList;
                            dataOut.fascistCount = game.fascistCount;
                            dataOut.proIndex = game.proIndex;
                            dataOut.proList = game.proList;
                            dataOut.started = game.started;
                            dataOut.name = userService.socketIdToUser[socket.id];
                            dataOut.type = "gamestart";
                            send(game.playerList, dataOut);
                            selectPre(game.playerList[Math.floor(Math.random() * game.playerList.length)]);
                            break;
                        }
                    case "prmSelect":
                        {
                            console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                            game.setPrm(data.user);
                            console.log(Date().toString().slice(15, 25), "创建新投票");
                            game.setVote();
                            var dataOut = new Data();
                            dataOut.type = "pleaseVote";
                            dataOut.playerList = game.playerList;
                            dataOut.prm = game.prm;
                            dataOut.pre = game.pre;
                            dataOut.voteCount = game.voteCount;
                            dataOut.nowVote = game.nowVote;
                            send(game.playerList, dataOut);
                            break;
                        }
                    case "vote":
                        {
                            console.log(Date().toString().slice(15, 25), userService.socketIdToUser[socket.id].name, "投票了");
                            var dataOut = new Data();
                            dataOut.type = "pleaseVote";
                            if (game.getVote(userService.socketIdToUser[socket.id].seatNo - 1, data.voteRes)) {
                                dataOut.voteRes = game.voteRes;
                                console.log("投票完成", game.voteCount + "/" + game.nowVote.length, "结果", game.voteRes + "/" + game.nowVote.length);
                                if (game.voteRes > game.nowVote.length / 2) {
                                    console.log("政府组建成功");
                                    findPro();
                                }
                                else {
                                    console.log("政府组建失败");
                                    selectPre(game.prenext);
                                }
                            }
                            else {
                                dataOut.nowVote = game.nowVote;
                                dataOut.voteCount = game.voteCount;
                                send(game.playerList, dataOut);
                            }
                            break;
                        }
                    case "proSelect":
                        {
                            proSelect(data.pro, data.proX3List);
                            break;
                        }
                    default:
                        console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
                }
            });
        });
    }
    return Network;
}());
exports.Network = Network;
