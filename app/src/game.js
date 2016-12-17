"use strict";
var server_1 = require("./server");
var data_1 = require("./data");
// import { getdate } from "./userService";
var myEmitter_1 = require("./myEmitter");
var Game = (function () {
    function Game() {
        // skillList = new Array<Function | string>();  // 技能列表
        this.skillList = new Array(); // 技能列表
        this.proList = new Array(); // 法案牌堆
        this.proIndex = 16; // 牌堆顶
        this.started = false; // 游戏是否开始
        this.playerList = new Array(); // 加入本次游戏的玩家列表，主要用于消息发送
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
        this.failTimes = 0; // 政府组件失败次数
        this.isVoted = false;
        this.voteList = new Array(); // 投票总记录
        this.voteRes = 0; // 投票结果
        this.fascist = new Array();
        this.liberal = new Array();
        // 游戏发言
        this.msgListAll = new Array(); // 总发言记录
        this.msgListNow = new Array(); // 当前发言记录
        this.speakTime = 5; // 发言时间 设定 单位 秒
    }
    Game.prototype.start = function (socketId) {
        this.playerList = server_1.userService.userList.filter(function (t) {
            return t.isSeat === true;
        });
        if (this.playerList.length < 5) {
            console.log("人数不足：", this.playerList.length);
            return false;
        }
        else {
            console.log("游戏开始", this.playerList.length);
            this.started = true;
            this.selectGame();
            this.makePro();
            this.shuffle();
            this.setPlayer();
            var dataOut = new data_1.Data();
            dataOut.userList = server_1.userService.userList;
            dataOut.fascistCount = this.fascistCount;
            dataOut.proIndex = this.proIndex;
            dataOut.proList = this.proList;
            dataOut.started = this.started;
            dataOut.user = server_1.userService.socketIdToUser[socketId];
            dataOut.type = "gamestart";
            dataOut.toWho = this.playerList;
            myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
            this.selectPre(this.playerList[Math.floor(Math.random() * this.playerList.length)]);
        }
    };
    Game.prototype.setPlayer = function () {
        console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
        var tmp;
        this.playerList.filter(function (t) { t.seatNo = Math.random(); });
        this.playerList.sort(function (a, b) { return a.seatNo - b.seatNo; });
        this.hitler = this.playerList[0];
        this.hitler.role = "Hitler";
        var hitData = new data_1.Data();
        hitData.toWho = this.hitler;
        hitData.type = "role";
        hitData.role = "Hitler";
        if (this.playerList.length < 6) {
            hitData.other = this.fascist;
        }
        myEmitter_1.myEmitter.emit("Send_Sth", hitData);
        for (var i = 1; i <= this.fascistCount; i++) {
            tmp = new data_1.Data();
            tmp.type = "role";
            tmp.role = "Fascist";
            tmp.toWho = this.playerList[i];
            tmp.other = this.fascist;
            tmp.target = this.hitler;
            myEmitter_1.myEmitter.emit("Send_Sth", tmp);
            this.fascist.push(this.playerList[i]);
            this.playerList[i].role = "Fascist";
        }
        console.log();
        for (var i = this.fascistCount + 1; i < this.playerList.length; i++) {
            tmp = new data_1.Data();
            tmp.type = "role";
            tmp.role = "Liberal";
            tmp.toWho = this.playerList[i];
            myEmitter_1.myEmitter.emit("Send_Sth", tmp);
            this.liberal.push(this.playerList[i]);
            this.playerList[i].role = "Liberal";
        }
        this.playerList.filter(function (t) { t.seatNo = Math.random(); });
        this.playerList.sort(function (a, b) { return a.seatNo - b.seatNo; });
        for (var i = 0; i < this.playerList.length; i++) {
            this.playerList[i].seatNo = i + 1;
        }
    };
    Game.prototype.makePro = function () {
        // 法案牌生成
        console.log("提案牌堆生成");
        for (var i = 0; i <= 16; i++) {
            this.proList.push(i);
        }
        console.log(this.proList);
    };
    // 3种游戏模式选择
    Game.prototype.selectGame = function () {
        console.log("根据人数选择本局游戏规则");
        var plyaerCount = this.playerList.length;
        if (plyaerCount >= 9) {
            console.log("选择9-10人游戏");
            this.fascistCount = 3;
            this.skillList[0] = this.invPlayer.bind(this);
            this.skillList[1] = this.invPlayer.bind(this);
            this.skillList[2] = this.preSelect.bind(this);
            this.skillList[3] = this.toKill.bind(this);
            this.skillList[4] = this.toKill.bind(this);
        }
        else {
            if (plyaerCount >= 7) {
                this.fascistCount = 2;
                console.log("选择7-8人游戏");
                this.skillList[0] = this.nothing.bind(this);
                this.skillList[1] = this.invPlayer.bind(this);
                this.skillList[2] = this.preSelect.bind(this);
                this.skillList[3] = this.toKill.bind(this);
                this.skillList[4] = this.toKill.bind(this);
            }
            else {
                if (plyaerCount >= 5) {
                    this.fascistCount = 1;
                    console.log("选择5-6人游戏");
                    this.skillList[0] = this.nothing.bind(this);
                    this.skillList[1] = this.nothing.bind(this);
                    this.skillList[2] = this.toLookPro.bind(this);
                    this.skillList[3] = this.toKill.bind(this);
                    this.skillList[4] = this.toKill.bind(this);
                }
                else {
                    console.log("人数不足");
                }
            }
        }
        this.liberalCount = plyaerCount - 1 - this.fascistCount;
    };
    // 提案牌洗牌
    Game.prototype.shuffle = function () {
        console.log("提案洗牌");
        this.proIndex = this.proList.length - 1; // 牌堆顶
        var mytmp = new Array();
        console.log("提案牌堆" + this.proList.length + "张");
        for (var i = 0; i <= 16; i++) {
            mytmp.push(Math.random());
        }
        this.proList.sort(function (a, b) {
            return mytmp[a] - mytmp[b];
        });
        console.log(this.proList);
    };
    // 选总统，一轮结束后继续游戏的象征
    Game.prototype.selectPre = function (player, next) {
        // if (pre) {pre.canbeselect="true";};
        this.playerList.filter(function (t) { t.isPre = false; });
        this.pre = server_1.userService.socketIdToUser[player.socketId];
        this.pre.isPre = true;
        if (!next) {
            // 顺序指定下届总统
            if (this.playerList[this.playerList.indexOf(player) + 1]) {
                this.prenext = this.playerList[this.playerList.indexOf(player) + 1];
            }
            else {
                this.prenext = this.playerList[0];
            }
            ;
        }
        else {
        }
        console.log("本届总统是", this.pre.name);
        console.log("下届总统是", this.prenext.name);
        // 投票数归零
        var data = new data_1.Data();
        data.playerList = this.playerList;
        data.pre = this.pre;
        data.prenext = this.prenext;
        data.type = "selectPrm";
        data.pre = this.pre;
        data.toWho = this.playerList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    // 设定总理
    Game.prototype.setPrm = function (user) {
        // 待投票总理
        this.prmTmp = server_1.userService.socketIdToUser[user.socketId];
        console.log(Date().toString().slice(15, 25), "创建新投票");
        this.setVote();
        var data = new data_1.Data();
        data.toWho = this.playerList;
        data.type = "pleaseVote";
        data.playerList = this.playerList;
        data.prmTmp = this.prmTmp;
        data.pre = this.pre;
        data.voteCount = this.voteCount;
        data.nowVote = this.nowVote;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    // 发起投票
    Game.prototype.setVote = function () {
        var tmp = new Array();
        this.voteCount = 0;
        for (var i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].isSurvival) {
                tmp[this.playerList[i].seatNo - 1] = 0;
            }
            else {
                tmp[this.playerList[i].seatNo - 1] = 4;
                this.voteCount = this.voteCount + 1;
            }
        }
        this.voteList.push(tmp);
        this.nowVote = tmp;
        this.isVoted = false;
        this.voteRes = 0;
    };
    // 结算投票
    Game.prototype.getVote = function (sockeId, res) {
        var data = new data_1.Data();
        this.nowVote[server_1.userService.socketIdToUser[sockeId].seatNo - 1] = res;
        this.voteCount = this.voteCount + 1;
        if (this.voteCount === this.nowVote.length) {
            // 投票完成
            if (this.nowVote.filter(function (t) {
                return t === 2;
            }).length * 2 > this.nowVote.length - this.nowVote.filter(function (t) {
                return t === 4;
            }).length) {
                // 成功
                if (this.proEffRed >= 3 && this.prmTmp.role === "Hitler") {
                    //  总理生效 判断希特勒上位
                    console.log("游戏结束");
                    this.gameover("游戏结束，红色胜利");
                }
                else {
                    this.prm = this.prmTmp;
                    data.prm = this.prm;
                    data.voteRes = 1;
                    this.findPro();
                }
            }
            else {
                // 失败
                data.voteRes = 0;
                this.failTimes = this.failTimes + 1;
                if (this.failTimes === 3) {
                    // 强制生效
                    this.proEff(this.proList[this.proIndex], true);
                }
                else {
                    // say 不发言直接下一届政府
                    this.selectPre(this.prenext);
                }
            }
        }
        else {
            console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
        }
        data.type = "pleaseVote";
        data.nowVote = this.nowVote;
        data.toWho = this.playerList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    //  法案选择
    Game.prototype.proSelect = function (proDiscard, list) {
        console.log("待选牌堆" + list.length + "张");
        if (list.length === 3) {
            list.splice(list.indexOf(proDiscard), 1); // 从待选牌堆删除该法案
            this.findPro(list);
        }
        else {
            list.splice(list.indexOf(proDiscard), 1); // 从待选牌堆删除该法案
            console.log("待选牌堆" + list);
            this.proEff(list[0]); // 法案生效
        }
    };
    // 选法案，list为空则为总统，list有内容则为总理
    Game.prototype.findPro = function (list) {
        if (!list) {
            console.log("总统选提案");
            var proTmp = [];
            console.log("牌堆顶位置编号" + this.proIndex);
            if (this.proIndex < 2) {
                console.log("牌堆数量不足");
                this.shuffle();
            }
            // 摸牌
            for (var n = this.proIndex; n >= this.proIndex - 2; n--) {
                proTmp.push(this.proList[n]);
            }
            ;
            this.proIndex = this.proIndex - 3; // 摸三张后牌堆顶变换
            this.proX3List = proTmp;
            console.log("摸牌之后牌堆顶位置编号" + this.proIndex);
            console.log("待选法案堆" + proTmp);
            var data = new data_1.Data;
            data.type = "choosePro";
            data.toWho = this.playerList.filter(function (t) {
                return t.isPre !== true;
            });
            data.proIndex = this.proIndex;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            var data2 = new data_1.Data();
            data2.proX3List = this.proX3List;
            data2.type = "choosePro";
            data2.toWho = this.pre;
            myEmitter_1.myEmitter.emit("Send_Sth", data2);
        }
        else {
            this.proX3List = list;
            console.log("总理选提案");
            var data = new data_1.Data;
            data.type = "choosePro";
            data.toWho = this.playerList.filter(function (t) {
                return t.isPrm !== true;
            });
            data.proList = this.proList;
            data.proIndex = this.proIndex;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            var data2 = new data_1.Data();
            data2.proX3List = this.proX3List;
            data2.type = "choosePro";
            data2.toWho = this.prm;
            myEmitter_1.myEmitter.emit("Send_Sth", data2);
        }
    };
    Game.prototype.proEff = function (pro, force) {
        var _this = this;
        this.failTimes = 0;
        this.pro = pro;
        console.log(pro);
        if (pro >= 6) {
            console.log("红色提案生效");
            this.proEffRed = this.proEffRed + 1;
        }
        else {
            console.log("蓝色提案生效");
            this.proEffBlue = this.proEffBlue + 1;
        }
        var data = new data_1.Data();
        data.type = "proEff";
        data.pro = this.pro;
        data.proEffRed = this.proEffRed;
        data.proEffBlue = this.proEffBlue;
        data.toWho = this.playerList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        if (this.proEffRed === 6) {
            this.started = false;
            console.log("红方胜利");
            //   todo:结算
            console.log("游戏结束");
            this.gameover("游戏结束，红色胜利");
        }
        else {
            if (this.proEffBlue === 5) {
                this.started = false;
                console.log("蓝方胜利");
                //   todo:结算
                console.log("游戏结束");
                this.gameover("游戏结束，蓝色胜利");
            }
            else {
                this.proList.splice(this.proList.indexOf(pro), 1); // 从总牌堆删除生效法案
                for (var n in this.playerList) {
                    this.playerList[n].isLastPre = false;
                    this.playerList[n].isLastPrm = false;
                    this.playerList[n].isPre = false;
                    this.playerList[n].isPrm = false;
                } // 上届政府标记归零
                if (!force) {
                    // 普通生效，变更政府标记
                    this.pre.isLastPre = true;
                    this.prm.isLastPrm = true;
                    this.prm = null;
                }
                else {
                    // 强制生效时，牌堆顶摸走一张
                    this.proIndex = this.proIndex - 1;
                }
                if (pro >= 6) {
                    // 红色法案生效，执行技能
                    // test
                    console.log("执行技能");
                    this.skillList[this.proEffRed - 1]();
                }
                else {
                    // 蓝色法案生效，执行技能
                    // say
                    // 发起发言
                    myEmitter_1.myEmitter.emit("speak_start");
                    myEmitter_1.myEmitter.on("speak_endAll", function () {
                        _this.selectPre(_this.prenext); // 切换总统 继续游戏
                    });
                }
            }
        }
        data.type = "proEff";
        data.proIndex = this.proIndex;
        data.proList = this.proList;
        data.toWho = this.playerList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    // 无技能
    Game.prototype.nothing = function () {
        var _this = this;
        console.log("无技能");
        // say
        // 发起发言
        myEmitter_1.myEmitter.emit("speak_start");
        myEmitter_1.myEmitter.on("speak_endAll", function () {
            _this.selectPre(_this.prenext); // 切换总统 继续游戏
        });
    };
    Game.prototype.tmp = function () { };
    Game.prototype.back = function () { };
    // 技能：调查身份
    Game.prototype.invPlayer = function (player) {
        var _this = this;
        console.log("调查身份");
        if (typeof player === "undefined") {
            console.log("通知总统 调查身份");
            var data = new data_1.Data();
            data.type = "invPlayer";
            data.toWho = this.playerList;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
        }
        else {
            console.log("告知调查结果");
            var data2 = new data_1.Data();
            data2.type = "invPlayer";
            if (this.liberal.filter(function (t) {
                return t.socketId === player.socketId;
            })[0]) {
                data2.other = "./pic/结果蓝.png";
            }
            else {
                data2.other = "./pic/结果红.png";
            }
            data2.target = player;
            data2.toWho = this.pre;
            myEmitter_1.myEmitter.emit("Send_Sth", data2);
            // say
            // 发起发言
            myEmitter_1.myEmitter.emit("speak_start");
            myEmitter_1.myEmitter.on("speak_endAll", function () {
                _this.selectPre(_this.prenext); // 切换总统 继续游戏
            });
        }
    };
    // 技能：指定总统
    Game.prototype.preSelect = function () {
        console.log("指定总统");
        var tmp = new Array();
        var data = new data_1.Data();
        data.type = "preSelect";
        data.toWho = this.playerList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    // 技能：枪决
    Game.prototype.toKill = function (player) {
        var _this = this;
        console.log("枪决");
        // 杀人动作
        if (typeof player === "undefined") {
            // 通知杀人列表
            var data = new data_1.Data();
            data.type = "toKill";
            data.toWho = this.playerList;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
        }
        else {
            // 结算杀人选择
            var data = new data_1.Data();
            data.type = "toKill";
            data.target = player;
            data.userList = server_1.userService.userList;
            data.toWho = this.playerList;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            player = server_1.userService.socketIdToUser[player.socketId];
            if (player.role === "Hitler") {
                console.log("游戏结束");
                this.gameover("游戏结束，蓝色胜利");
            }
            else {
                // 枪毙的是下届总统时，切换下届总统
                if (this.prenext === player) {
                    console.log("被枪决的玩家是下届总统");
                    if (this.playerList[this.playerList.indexOf(player) + 1]) {
                        console.log("被枪决的玩家不是队列末位");
                        this.prenext = this.playerList[this.playerList.indexOf(player) + 1];
                    }
                    else {
                        console.log("被枪决的玩家是队列末位");
                        this.prenext = this.playerList[0];
                        console.log(this.prenext);
                    }
                    ;
                }
                // 从玩家状态修改
                player.isSurvival = false;
                // say
                // 发起发言
                myEmitter_1.myEmitter.emit("speak_start");
                myEmitter_1.myEmitter.on("speak_endAll", function () {
                    _this.selectPre(_this.prenext); // 切换总统 继续游戏
                });
            }
        }
    };
    // 技能：查看法案
    Game.prototype.toLookPro = function () {
        var _this = this;
        console.log("查看法案");
        var data = new data_1.Data();
        data.type = "toLookPro";
        data.toWho = this.pre;
        data.proX3List = new Array();
        for (var i = 0; i <= 2; i++) {
            data.proX3List.push(this.proList[this.proIndex - i]);
        }
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        // say
        // 发起发言
        myEmitter_1.myEmitter.emit("speak_start");
        myEmitter_1.myEmitter.on("speak_endAll", function () {
            _this.selectPre(_this.prenext); // 切换总统 继续游戏
        });
    };
    // gameOver
    Game.prototype.gameover = function (res) {
        var tmp = new Array();
        var data = new data_1.Data();
        data.type = "gameover";
        data.toWho = this.playerList;
        data.other = res;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    return Game;
}());
exports.Game = Game;
