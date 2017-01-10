"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
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
var server_1 = require("./server");
var server_2 = require("./server");
var data_1 = require("./data");
var hgnmsg_1 = require("./hgnmsg");
var msg_server_1 = require("./msg_server");
var myEmitter_1 = require("./myEmitter");
var Game = (function () {
    function Game() {
        this.skillnamelist = new Array();
        this.proX3List = new Array(); // 法案牌摸的三张牌
        this.proX3ListHide = new Array(); // 法案牌摸的三张牌平民模板
        this.started = false; // 游戏是否开始
        // 游戏发言
        this.msgListAll = new Array(); // 总发言记录
        this.msgListNow = new Array(); // 当前发言记录
        this.speakTime = 2000; // 发言时间 设定 单位 秒
        this.lastTurn = new Map(); // 上一次政府情况
        server_2.hList.playerList = server_2.hList.playerList;
    }
    Game.prototype.welcomeback = function (who) {
        if (!this.started) {
            console.log("游戏未开始，无资料更新");
            return;
        }
        var dataOut = new data_1.Data("loaddata");
        dataOut.fascistCount = this.fascistCount;
        dataOut.proIndex = this.proIndex;
        dataOut.proList = this.proList;
        dataOut.skillnamelist = this.skillnamelist;
        dataOut.proEffBlue = this.proEffBlue;
        dataOut.proEffRed = this.proEffRed;
        dataOut.failTimes = this.failTimes;
        dataOut.fascistCount = this.fascistCount;
        dataOut.liberalCount = this.liberalCount;
        dataOut.toWho = who;
        dataOut.started = this.started;
        dataOut.gametype = this.gametype;
        // dataOut.started = this.started;
        dataOut.speakTime = this.speakTime;
        myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
        this.msgServices.showWho(who);
    };
    Game.prototype.start = function (socketId) {
        server_2.hList.playerList = server_2.hList.userList.filter(function (t) {
            return t.isSeat === true;
        });
        if (server_2.hList.playerList.length < 5) {
            console.log("人数不足：", server_2.hList.playerList.length);
            return false;
        }
        else {
            console.log("游戏开始", server_2.hList.playerList.length);
            this.gameInit();
            this.setPlayer();
            this.msgServices = new msg_server_1.MsgServices();
            var dataOut = new data_1.Data("gamestart");
            dataOut.hList = server_2.hList;
            dataOut.fascistCount = this.fascistCount;
            dataOut.failTimes = this.failTimes;
            dataOut.proIndex = this.proIndex;
            dataOut.proList = this.proList;
            dataOut.started = this.started;
            dataOut.gametype = this.gametype;
            dataOut.speakTime = this.speakTime;
            dataOut.skillnamelist = this.skillnamelist;
            dataOut.user = server_1.userService.socketIdToUser[socketId];
            myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
            var gamestartmsg = new hgnmsg_1.Msg("gamestart");
            this.msgServices.pushAll(gamestartmsg);
            this.selectPre(server_2.hList.playerList[Math.floor(Math.random() * server_2.hList.playerList.length)]);
        }
    };
    /**
     * 玩家分配身份
     * 每一名玩家独立发送 身份消息
     */
    Game.prototype.setPlayer = function () {
        console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
        server_2.hList.playerList.filter(function (t) { t.seatNo = Math.random(); });
        server_2.hList.playerList.sort(function (a, b) { return a.seatNo - b.seatNo; });
        this.hitler = server_2.hList.playerList[0];
        this.hitler.role = "Hitler";
        for (var i = 1; i <= this.fascistCount; i++) {
            this.fascist.push(server_2.hList.playerList[i]);
            server_2.hList.playerList[i].role = "Fascist";
            server_2.hList.playerList[i].hitler = this.hitler;
        }
        if (server_2.hList.playerList.length < 7) {
            for (var i = 1; i <= this.fascistCount; i++) {
                this.hitler["fascist" + i.toString()] = JSON.parse(JSON.stringify(server_2.hList.playerList[i]));
            }
        }
        for (var n = 1; n <= this.fascistCount; n++) {
            for (var i = 1; i <= this.fascistCount; i++) {
                server_2.hList.playerList[n]["fascist" + i.toString()] = JSON.parse(JSON.stringify(server_2.hList.playerList[i]));
            }
        }
        for (var i = this.fascistCount + 1; i < server_2.hList.playerList.length; i++) {
            this.liberal.push(server_2.hList.playerList[i]);
            server_2.hList.playerList[i].role = "Liberal";
        }
        server_2.hList.playerList.filter(function (t) { t.seatNo = Math.random(); });
        server_2.hList.playerList.sort(function (a, b) { return a.seatNo - b.seatNo; });
        for (var i = 0; i < server_2.hList.playerList.length; i++) {
            server_2.hList.playerList[i].seatNo = i + 1;
        }
        var data = new data_1.Data("updata");
        data.hList = server_2.hList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        console.log(server_2.hList);
        console.log("-------完成");
    };
    Game.prototype.makePro = function () {
        // 法案牌生成
        console.log("提案牌堆生成");
        for (var i = 0; i <= 16; i++) {
            this.proList.push(i);
        }
        console.log(this.proList);
    };
    /**
     * 选择游戏板
     * 无通知
     */
    Game.prototype.selectGame = function () {
        console.log("根据人数选择本局游戏规则");
        var plyaerCount = server_2.hList.playerList.length;
        if (plyaerCount >= 9) {
            console.log("选择9-10人游戏");
            this.fascistCount = 3;
            this.gametype = 3;
            this.skillList[0] = this.invPlayer.bind(this);
            this.skillList[1] = this.invPlayer.bind(this);
            this.skillList[2] = this.preSelect.bind(this);
            this.skillList[3] = this.toKill.bind(this);
            this.skillList[4] = this.toKill.bind(this);
            this.skillnamelist = [1, 1, 2, 4, 5];
        }
        else {
            if (plyaerCount >= 7) {
                this.fascistCount = 2;
                this.gametype = 2;
                console.log("选择7-8人游戏");
                this.skillList[0] = this.nothing.bind(this);
                this.skillList[1] = this.invPlayer.bind(this);
                this.skillList[2] = this.preSelect.bind(this);
                this.skillList[3] = this.toKill.bind(this);
                this.skillList[4] = this.toKill.bind(this);
                this.skillnamelist = [0, 1, 2, 4, 5];
            }
            else {
                if (plyaerCount >= 5) {
                    this.fascistCount = 1;
                    this.gametype = 1;
                    console.log("选择5-6人游戏");
                    this.skillList[0] = this.toKill.bind(this);
                    this.skillList[1] = this.nothing.bind(this);
                    this.skillList[2] = this.toLookPro.bind(this);
                    this.skillList[3] = this.toKill.bind(this);
                    this.skillList[4] = this.toKill.bind(this);
                    this.skillnamelist = [0, 0, 3, 4, 5];
                }
                else {
                    console.log("人数不足");
                }
            }
        }
        this.liberalCount = plyaerCount - 1 - this.fascistCount;
    };
    /**
     * 洗牌
     * 无通知
     */
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
        var data = new data_1.Data("shuffle");
        // data.msg = new Msg("system", "法案牌堆和弃牌堆重新洗混了");
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    Game.prototype.next = function (player) {
        if (server_2.hList.playerList[server_2.hList.playerList.indexOf(player) + 1]) {
            this.prenext = server_2.hList.playerList[server_2.hList.playerList.indexOf(player) + 1];
        }
        else {
            this.prenext = server_2.hList.playerList[0];
        }
        ;
    };
    /**
     * 选总统，一轮结束后继续游戏的象征
     * 通知玩家
     */
    Game.prototype.selectPre = function (player) {
        if (this.prm) {
            this.prm.isPrm = false;
        }
        server_2.hList.playerList.filter(function (t) { t.isPre = false; });
        if (this.pre) {
            this.pre.isPre = false;
        }
        this.pre = server_1.userService.socketIdToUser[player.socketId];
        this.pre.isPre = true;
        if (this.tmppre) {
            // 技能导致非顺序指定
            console.log("技能导致总统顺序变化");
            this.prenext = this.tmppre;
            this.tmppre = false;
        }
        else {
            // 顺序指定下届总统
            console.log("顺序指定总统");
            this.next(player);
            if (!this.prenext.isSurvival) {
                this.next(this.prenext);
            }
        }
        console.log("本届总统是", this.pre.name, "->", this.prenext.name);
        // console.log("下届总统是", this.prenext.name);
        // 处理是否可选问题
        var playerSurvival = server_2.hList.playerList.filter(function (t) {
            return t.isSurvival;
        }).length;
        // console.log("当前存活人数", playerSurvival);
        if (playerSurvival > 5) {
            // console.log("人数大于5");
            server_2.hList.playerList.filter(function (t) {
                if (t.isLastPrm || t.isLastPre) {
                    t.canBeSelect = false;
                }
                else {
                    t.canBeSelect = true;
                }
            });
        }
        else {
            // console.log("人数小于等于5");
            server_2.hList.playerList.filter(function (t) {
                if (t.isLastPrm) {
                    t.canBeSelect = false;
                }
                else {
                    t.canBeSelect = true;
                }
            });
        }
        this.pre.canBeSelect = false;
        var data = new data_1.Data("selectPrm");
        data.hList = server_2.hList;
        data.pre = this.pre;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        var msg = new hgnmsg_1.Msg("selectPrm");
        msg.msg = "等待总统选择总理";
        msg.step = 0;
        msg.pre = this.pre;
        msg.userList = server_2.hList.playerList;
        this.msgServices.pushAll(msg, this.pre);
        msg.step = 1;
        this.msgServices.pushWho(this.pre, msg);
    };
    // 设定总理
    Game.prototype.setPrm = function (user) {
        // 待投票总理
        this.prmTmp = server_1.userService.socketIdToUser[user.socketId];
        this.prmTmp.isPrm = true;
        console.log(Date().toString().slice(15, 25), "创建新投票");
        this.setVote();
        var data0 = new data_1.Data("updata");
        myEmitter_1.myEmitter.emit("Send_Sth", data0);
        var data = new data_1.Data("pleaseVote");
        data.hList = server_2.hList;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        var msgvotestart = new hgnmsg_1.Msg("vote_please");
        msgvotestart.pre = this.pre;
        msgvotestart.prm = this.prmTmp;
        msgvotestart.userList = server_2.hList.playerList;
        msgvotestart.voteCount = this.voteCount;
        msgvotestart.nowVote = this.nowVote;
        this.msgServices.updataAll(msgvotestart);
    };
    // 发起投票
    Game.prototype.setVote = function () {
        var tmp = new Array();
        this.voteCount = 0;
        for (var i = 0; i < server_2.hList.playerList.length; i++) {
            if (server_2.hList.playerList[i].isSurvival) {
                tmp[server_2.hList.playerList[i].seatNo - 1] = 0;
            }
            else {
                tmp[server_2.hList.playerList[i].seatNo - 1] = 4;
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
        var _this = this;
        this.nowVote[server_1.userService.socketIdToUser[sockeId].seatNo - 1] = res;
        this.voteCount = this.voteCount + 1;
        console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
        // data.nowVote = this.nowVote;
        // myEmitter.emit("Send_Sth", data);
        var msgvote = new hgnmsg_1.Msg("vote_please");
        msgvote.pre = this.pre;
        msgvote.prm = this.prmTmp;
        msgvote.userList = server_2.hList.playerList;
        msgvote.voteCount = this.voteCount;
        msgvote.nowVote = this.nowVote;
        this.msgServices.updataAll(msgvote);
        if (this.voteCount === this.nowVote.length) {
            // 投票完成
            var data = new data_1.Data("updata");
            if (this.nowVote.filter(function (t) {
                return t === 2;
            }).length * 2 > this.nowVote.length - this.nowVote.filter(function (t) {
                return t === 4;
            }).length) {
                // 成功data
                msgvote.voteRes = 1;
                this.msgServices.updataAll(msgvote);
                if (this.prm) {
                    this.prm.isPrm = false;
                }
                this.prm = this.prmTmp;
                this.prm.isPrm = true;
                data.prm = this.prm;
                data.hList = server_2.hList;
                if (this.proEffRed >= 3 && this.prmTmp.role === "Hitler") {
                    //  总理生效 判断希特勒上位
                    console.log("游戏结束");
                    setTimeout(function () { return _this.gameover("游戏结束，红色胜利"); }, 2000);
                    // todo
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                }
                else {
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    setTimeout(function () { return _this.findPro(); }, 2000);
                }
            }
            else {
                // 失败
                msgvote.voteRes = 2;
                this.msgServices.updataAll(msgvote);
                this.prmTmp.isPrm = false;
                data.voteRes = 0;
                this.failTimes = this.failTimes + 1;
                data.failTimes = this.failTimes;
                if (this.failTimes === 3) {
                    // 强制生效
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    setTimeout(function () { return _this.proEff(_this.proList[_this.proIndex], true); }, 2000);
                }
                else {
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    // say 不发言直接下一届政府
                    setTimeout(function () { return _this.selectPre(_this.prenext); }, 2000);
                }
            }
        }
        else {
        }
    };
    Game.prototype.veto_all = function () {
        var _this = this;
        // todo 通知玩家
        this.changestepWho(40);
        var data = new data_1.Data("veto_all");
        this.failTimes = this.failTimes + 1;
        data.failTimes = this.failTimes;
        if (this.failTimes === 3) {
            // 强制生效
            this.proEff(this.proList[this.proIndex], true);
        }
        else {
            // 发言
            myEmitter_1.myEmitter.emit("speak_start");
            myEmitter_1.myEmitter.once("speak_endAll", function () {
                _this.selectPre(_this.prenext); // 切换总统 继续游戏
            });
        }
    };
    Game.prototype.speakstart = function (who) {
        var spk = new hgnmsg_1.Msg("playerSpk");
        spk.who = Object.assign({}, who);
        spk.step = 1;
        spk.msgList = [];
        this.msgServices.pushAll(spk);
    };
    Game.prototype.speaksth = function (msg) {
        this.msgServices.updataspk(1, msg);
    };
    Game.prototype.speakend = function () {
        this.msgServices.updataspk(0);
    };
    //  法案牌过程
    Game.prototype.findPro = function (list, proDiscard) {
        if (!list) {
            var proTmp = [];
            if (this.proIndex < 2) {
                this.shuffle();
            }
            for (var n = this.proIndex; n >= this.proIndex - 2; n--) {
                proTmp.push(this.proList[n]);
            }
            ;
            this.proIndex = this.proIndex - 3; // 摸三张后牌堆顶变换
            this.proX3List = [];
            this.proX3List[0] = proTmp;
            this.proX3ListHide[0] = ["x", "x", "x"];
            // -----pre_CP----
            var data = new data_1.Data("choosePro");
            data.proIndex = this.proIndex;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            var chooseProMsg1 = new hgnmsg_1.Msg("choosePro");
            chooseProMsg1.pre = this.pre;
            chooseProMsg1.prm = this.prm;
            chooseProMsg1.step = 1;
            chooseProMsg1.proX3List = [];
            chooseProMsg1.proX3List[0] = ["x", "x", "x"];
            this.msgServices.pushAll(chooseProMsg1);
            chooseProMsg1 = new hgnmsg_1.Msg("choosePro");
            chooseProMsg1.pre = this.pre;
            chooseProMsg1.prm = this.prm;
            chooseProMsg1.step = 1;
            chooseProMsg1.proX3List = [];
            chooseProMsg1.proX3List[0] = proTmp;
            this.msgServices.updataWho(this.pre, chooseProMsg1);
        }
        else {
            console.log("列表", list);
            console.log("弃牌", proDiscard);
            if (list[0].length === 3) {
                // -----prm_CP----
                list[0].splice(list[0].indexOf(proDiscard), 1); // 从待选牌堆删除该法案
                this.proX3List[0] = [proDiscard];
                this.proX3List[1] = list[0];
                this.proX3ListHide[0] = ["x"];
                this.proX3ListHide[1] = ["x", "x"];
                if (this.proEffRed < 5) {
                    // -----无否决权
                    var data = new data_1.Data("choosePro");
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    var chooseProMsg2 = new hgnmsg_1.Msg("choosePro");
                    chooseProMsg2.pre = this.pre;
                    chooseProMsg2.prm = this.prm;
                    chooseProMsg2.step = 2;
                    chooseProMsg2.proX3List = [];
                    chooseProMsg2.proX3List[0] = ["x"];
                    chooseProMsg2.proX3List[1] = ["x", "x"];
                    for (var i = 0; i < server_2.hList.playerList.length; i++) {
                        if (!server_2.hList.playerList[i].isPre && !server_2.hList.playerList[i].isPrm) {
                            this.msgServices.updataWho(server_2.hList.playerList[i], chooseProMsg2);
                        }
                    }
                    chooseProMsg2 = new hgnmsg_1.Msg("choosePro");
                    chooseProMsg2.pre = this.pre;
                    chooseProMsg2.prm = this.prm;
                    chooseProMsg2.step = 2;
                    chooseProMsg2.proX3List = [];
                    chooseProMsg2.proX3List[0] = ["x"];
                    chooseProMsg2.proX3List[1] = list[0];
                    this.msgServices.updataWho(this.prm, chooseProMsg2);
                    chooseProMsg2 = new hgnmsg_1.Msg("choosePro");
                    chooseProMsg2.pre = this.pre;
                    chooseProMsg2.prm = this.prm;
                    chooseProMsg2.step = 2;
                    chooseProMsg2.proX3List = [];
                    chooseProMsg2.proX3List[1] = list[0];
                    chooseProMsg2.proX3List[0] = [proDiscard];
                    this.msgServices.updataWho(this.pre, chooseProMsg2);
                }
                else {
                    // ------有否决权
                    var chooseProMsg2 = new hgnmsg_1.Msg("choosePro");
                    chooseProMsg2.pre = this.pre;
                    chooseProMsg2.prm = this.prm;
                    chooseProMsg2.step = 3;
                    chooseProMsg2.proX3List = [];
                    chooseProMsg2.proX3List[0] = ["x"];
                    chooseProMsg2.proX3List[1] = ["x", "x"];
                    for (var i = 0; i < server_2.hList.playerList.length; i++) {
                        if (!server_2.hList.playerList[i].isPre && !server_2.hList.playerList[i].isPrm) {
                            this.msgServices.updataWho(server_2.hList.playerList[i], chooseProMsg2);
                        }
                    }
                    chooseProMsg2 = new hgnmsg_1.Msg("choosePro");
                    chooseProMsg2.pre = this.pre;
                    chooseProMsg2.prm = this.prm;
                    chooseProMsg2.proX3List = [];
                    chooseProMsg2.proX3List[0] = ["x"];
                    chooseProMsg2.step = 31;
                    chooseProMsg2.proX3List[1] = list[0];
                    this.msgServices.updataWho(this.prm, chooseProMsg2);
                    chooseProMsg2 = new hgnmsg_1.Msg("choosePro");
                    chooseProMsg2.pre = this.pre;
                    chooseProMsg2.prm = this.prm;
                    chooseProMsg2.step = 3;
                    chooseProMsg2.proX3List = [];
                    chooseProMsg2.proX3List[1] = list[0];
                    chooseProMsg2.proX3List[0] = [proDiscard];
                    this.msgServices.updataWho(this.pre, chooseProMsg2);
                }
            }
            else {
                //  ------CP_end--------生效过程
                list[1].splice(list[1].indexOf(proDiscard), 1); // 从待选牌堆删除该法案
                this.proX3List[2] = list[1];
                this.proX3List[1] = [proDiscard];
                this.proX3ListHide[1] = ["x"];
                this.proX3ListHide[2] = ["x"];
                var data = new data_1.Data("choosePro");
                myEmitter_1.myEmitter.emit("Send_Sth", data);
                var chooseProMsg3 = new hgnmsg_1.Msg("choosePro");
                chooseProMsg3.pre = this.pre;
                chooseProMsg3.prm = this.prm;
                chooseProMsg3.step = 0;
                chooseProMsg3.proX3List = [];
                chooseProMsg3.proX3List[0] = ["x"];
                chooseProMsg3.proX3List[1] = ["x"];
                chooseProMsg3.proX3List[2] = list[1];
                for (var i = 0; i < server_2.hList.playerList.length; i++) {
                    if (!server_2.hList.playerList[i].isPre && !server_2.hList.playerList[i].isPrm) {
                        this.msgServices.updataWho(server_2.hList.playerList[i], chooseProMsg3);
                    }
                }
                chooseProMsg3 = new hgnmsg_1.Msg("choosePro");
                chooseProMsg3.pre = this.pre;
                chooseProMsg3.prm = this.prm;
                chooseProMsg3.step = 0;
                chooseProMsg3.proX3List = [];
                chooseProMsg3.proX3List[0] = ["x"];
                chooseProMsg3.proX3List[2] = list[1];
                chooseProMsg3.proX3List[1] = [proDiscard];
                this.msgServices.updataWho(this.prm, chooseProMsg3);
                chooseProMsg3 = new hgnmsg_1.Msg("choosePro");
                chooseProMsg3.pre = this.pre;
                chooseProMsg3.prm = this.prm;
                chooseProMsg3.step = 0;
                chooseProMsg3.proX3List = [];
                chooseProMsg3.proX3List[2] = list[1];
                chooseProMsg3.proX3List[1] = [proDiscard];
                chooseProMsg3.proX3List[0] = this.msgServices.allPlayerMsgList[this.pre.seatNo][this.msgServices.allPlayerMsgList[this.pre.seatNo].length - 1].proX3List[0];
                this.msgServices.updataWho(this.pre, chooseProMsg3);
                this.proEff(this.proX3List[2][0]); // 法案生效
                this.proX3List = [];
                this.proX3ListHide = [];
            }
        }
    };
    // 等待动作结算
    Game.prototype.waitSth = function () {
        return new Promise(function (resolve) {
            myEmitter_1.myEmitter.once("skill_is_done", function () {
                console.log("动作完成");
                resolve();
            });
        });
    };
    Game.prototype.proEff = function (pro, force) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var data, data2, n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = new data_1.Data("proEff");
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
                        data.failTimes = 0;
                        data.pro = this.pro;
                        data.proEffRed = this.proEffRed;
                        data.proEffBlue = this.proEffBlue;
                        myEmitter_1.myEmitter.emit("Send_Sth", data);
                        data2 = new data_1.Data("proEff");
                        if (!(this.proEffRed === 6))
                            return [3 /*break*/, 1];
                        this.started = false;
                        console.log("红方胜利");
                        //   todo:结算
                        console.log("游戏结束");
                        myEmitter_1.myEmitter.emit("Send_Sth", data2);
                        this.gameover("游戏结束，红色胜利");
                        return [3 /*break*/, 6];
                    case 1:
                        if (!(this.proEffBlue === 5))
                            return [3 /*break*/, 2];
                        this.started = false;
                        console.log("蓝方胜利");
                        //   todo:结算
                        console.log("游戏结束");
                        this.gameover("游戏结束，蓝色胜利");
                        myEmitter_1.myEmitter.emit("Send_Sth", data2);
                        return [3 /*break*/, 6];
                    case 2:
                        this.proList.splice(this.proList.indexOf(pro), 1); // 从总牌堆删除生效法案
                        for (n in server_2.hList.playerList) {
                            server_2.hList.playerList[n].isLastPre = false;
                            server_2.hList.playerList[n].isLastPrm = false;
                        } // 上届政府标记归零
                        if (!!force)
                            return [3 /*break*/, 5];
                        // 普通生效，变更政府标记
                        this.pre.isLastPre = true;
                        this.prm.isLastPrm = true;
                        data.proIndex = this.proIndex;
                        data.proList = this.proList;
                        myEmitter_1.myEmitter.emit("Send_Sth", data);
                        if (!(pro >= 6))
                            return [3 /*break*/, 4];
                        // 红色法案生效，执行技能
                        // test
                        console.log("执行技能");
                        this.skillList[this.proEffRed - 1]();
                        console.log("等待动作");
                        return [4 /*yield*/, this.waitSth()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        myEmitter_1.myEmitter.emit("speak_start");
                        myEmitter_1.myEmitter.once("speak_endAll", function () {
                            var msgDataToAll = new data_1.Data("speak_endAll");
                            myEmitter_1.myEmitter.emit("Send_Sth", msgDataToAll);
                            _this.selectPre(_this.prenext); // 切换总统 继续游戏
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        // 强制生效时，牌堆顶摸走一张
                        server_2.hList.playerList.filter(function (t) {
                            t.isLastPre = false;
                            t.isLastPrm = false;
                        });
                        this.proIndex = this.proIndex - 1;
                        data.proIndex = this.proIndex;
                        data.proList = this.proList;
                        myEmitter_1.myEmitter.emit("Send_Sth", data);
                        myEmitter_1.myEmitter.emit("speak_start");
                        myEmitter_1.myEmitter.once("speak_endAll", function () {
                            var msgDataToAll = new data_1.Data("speak_endAll");
                            myEmitter_1.myEmitter.emit("Send_Sth", msgDataToAll);
                            _this.selectPre(_this.prenext); // 切换总统 继续游戏
                        });
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // 无技能
    Game.prototype.nothing = function () {
        console.log("无技能");
        setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 0);
    };
    // 技能：调查身份
    Game.prototype.invPlayer = function (player) {
        return __awaiter(this, void 0, void 0, function () {
            var data, invPlayerMsg, data2, data3, invPlayerMsg;
            return __generator(this, function (_a) {
                console.log("调查身份");
                if (typeof player === "undefined") {
                    console.log("通知总统 调查身份");
                    data = new data_1.Data("invPlayer");
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    invPlayerMsg = new hgnmsg_1.Msg("invPlayer");
                    invPlayerMsg.step = 2;
                    invPlayerMsg.userList = server_2.hList.playerList;
                    invPlayerMsg.who = this.pre;
                    this.msgServices.pushAll(invPlayerMsg, this.pre);
                    invPlayerMsg.step = 1;
                    this.msgServices.pushWho(this.pre, invPlayerMsg);
                }
                else {
                    console.log("告知调查结果");
                    data2 = new data_1.Data("invPlayer", this.pre);
                    if (this.liberal.filter(function (t) {
                        return t.socketId === player.socketId;
                    })[0]) {
                        data2.other = "./pic/结果蓝.png";
                    }
                    else {
                        data2.other = "./pic/结果红.png";
                    }
                    data2.target = player;
                    myEmitter_1.myEmitter.emit("Send_Sth", data2);
                    data3 = new data_1.Data("通知");
                    myEmitter_1.myEmitter.emit("Send_Sth", data3);
                    invPlayerMsg = new hgnmsg_1.Msg("invPlayer");
                    invPlayerMsg.who = this.pre;
                    invPlayerMsg.step = 4;
                    invPlayerMsg.target = player;
                    this.msgServices.updataAll(invPlayerMsg, this.pre);
                    invPlayerMsg.step = 3;
                    invPlayerMsg.role = data2.other;
                    this.msgServices.updataWho(this.pre, invPlayerMsg);
                    // todo 玩家确认过程
                    setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 0);
                }
                return [2 /*return*/];
            });
        });
    };
    // 技能：指定总统
    Game.prototype.preSelect = function () {
        console.log("指定总统");
        var tmp = new Array();
        var data = new data_1.Data("preSelect");
        var preSelect_msg = new hgnmsg_1.Msg("preSelect");
        preSelect_msg.step = 2;
        preSelect_msg.who = this.pre;
        preSelect_msg.userList = server_2.hList.playerList;
        this.msgServices.pushAll(preSelect_msg, this.pre);
        preSelect_msg.userList = server_2.hList.playerList;
        preSelect_msg.step = 1;
        this.msgServices.pushWho(this.pre, preSelect_msg);
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    Game.prototype.setPre = function (player) {
        var invPlayerMsg = new hgnmsg_1.Msg("preSelect");
        invPlayerMsg.who = this.pre;
        invPlayerMsg.step = 3;
        invPlayerMsg.target = player;
        this.msgServices.updataAll(invPlayerMsg);
        this.tmppre = this.prenext;
        player = server_2.hList.playerList.filter(function (t) {
            return t.name === player.name;
        })[0];
        this.prenext = player;
        setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 0);
    };
    // 技能：枪决
    Game.prototype.toKill = function (player) {
        console.log("枪决");
        // 杀人动作
        if (typeof player === "undefined") {
            // 通知杀人列表
            var data = new data_1.Data("toKill");
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            var toKill = new hgnmsg_1.Msg("toKill");
            toKill.step = 2;
            toKill.who = this.pre;
            toKill.userList = server_2.hList.playerList;
            this.msgServices.pushAll(toKill, this.pre);
            toKill.step = 1;
            this.msgServices.pushWho(this.pre, toKill);
        }
        else {
            // 结算杀人选择
            // 从玩家状态修改
            player = server_1.userService.socketIdToUser[player.socketId];
            player.isSurvival = false;
            var data = new data_1.Data("toKill");
            data.target = player;
            data.hList = server_2.hList;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            var toKill = new hgnmsg_1.Msg("toKill");
            toKill.who = this.pre;
            toKill.step = 3;
            toKill.target = player;
            this.msgServices.updataAll(toKill);
            player = server_1.userService.socketIdToUser[player.socketId];
            if (player.role === "Hitler") {
                console.log("游戏结束");
                this.gameover("游戏结束，蓝色胜利");
            }
            else {
                // 枪毙的是下届总统时，切换下届总统
                if (this.prenext.socketId === player.socketId) {
                    console.log("被枪决的玩家是下届总统");
                    if (server_2.hList.playerList[server_2.hList.playerList.indexOf(player) + 1]) {
                        console.log("被枪决的玩家不是队列末位");
                        this.prenext = server_2.hList.playerList[server_2.hList.playerList.indexOf(player) + 1];
                    }
                    else {
                        console.log("被枪决的玩家是队列末位");
                        this.prenext = server_2.hList.playerList[0];
                        console.log(this.prenext);
                    }
                    ;
                }
            }
            setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 0);
        }
    };
    // 技能：查看法案
    Game.prototype.toLookPro = function () {
        console.log("查看法案");
        if (this.proIndex < 2) {
            console.log("牌堆数量不足");
            this.shuffle();
        }
        var data = new data_1.Data("toLookPro", this.pre);
        data.proX3List = new Array();
        for (var i = 0; i <= 2; i++) {
            data.proX3List.push(this.proList[this.proIndex - i]);
        }
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        var data2 = new data_1.Data("通知");
        data2.toWho = server_2.hList.playerList.filter(function (t) {
            return !t.isPre;
        });
        var hgnlookpro_msg = new hgnmsg_1.Msg("hgnlookpro");
        hgnlookpro_msg.step = 1;
        hgnlookpro_msg.proX3List = data.proX3List;
        hgnlookpro_msg.who = this.pre;
        this.msgServices.pushWho(this.pre, hgnlookpro_msg);
        hgnlookpro_msg.proX3List = ["x", "x", "x"];
        hgnlookpro_msg.step = 0;
        this.msgServices.pushAll(hgnlookpro_msg, this.pre);
        myEmitter_1.myEmitter.emit("Send_Sth", data2);
        // todo 玩家查看法案时的确认过程
        setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 2000);
    };
    // gameOver
    Game.prototype.gameover = function (res) {
        var tmp = new Array();
        var data = new data_1.Data("gameover");
        data.other = res;
        myEmitter_1.myEmitter.emit("Send_Sth", data);
        var gameovermsg = new hgnmsg_1.Msg("gameover");
        gameovermsg.msg = res;
        gameovermsg.userList = server_2.hList.playerList;
        this.msgServices.pushAll(gameovermsg);
    };
    /**
     * 游戏初始化
     * 无通知
     */
    Game.prototype.gameInit = function () {
        //  ------------ 数据初始化start
        this.started = true;
        this.skillList = new Array();
        this.proList = new Array(); // 法案牌堆
        for (var i = 0; i <= 16; i++) {
            this.proList.push(i);
        }
        server_2.hList.userList.filter(function (t) {
            t.isPre = false;
            t.isPrm = false;
            t.isLastPre = false;
            t.isLastPrm = false;
            t.canBeSelect = false;
        });
        this.proIndex = 16; // 牌堆顶
        this.voteList = new Array(); // 投票总记录
        this.fascist = new Array();
        this.liberal = new Array();
        this.voteRes = 0;
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
        this.failTimes = 0; // 政府组件失败次数
        this.isVoted = false;
        this.proX3ListHide = [];
        this.proX3List = [];
        this.skillnamelist = new Array();
        //  ------------ 数据初始化end
        this.shuffle();
        this.selectGame();
    };
    Game.prototype.changestepWho = function (n) {
        switch (n) {
            case 41: {
                this.msgServices.changestepWho(this.pre, 41);
                this.msgServices.changestepAll(4, this.pre);
                break;
            }
            case 51: {
                this.msgServices.changestepWho(this.prm, 51);
                this.msgServices.changestepAll(5, this.prm);
                break;
            }
            case 40: {
                this.msgServices.changestepAll(40);
                break;
            }
            default:
                console.log("bug!!!!!bug!!!!!bug!!!!!bug!!!!!bug!!!!!bug!!!!!bug!!!!!bug!!!!!");
        }
    };
    return Game;
}());
exports.Game = Game;
