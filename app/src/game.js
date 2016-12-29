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
var data_1 = require("./data");
var data_2 = require("./data");
// import { getdate } from "./userService";
var myEmitter_1 = require("./myEmitter");
var Game = (function () {
    function Game() {
        this.proX3List = new Array(); // 法案牌摸的三张牌
        this.proX3ListHide = new Array(); // 法案牌摸的三张牌平民模板
        this.started = false; // 游戏是否开始
        this.playerList = new Array(); // 加入本次游戏的玩家列表，主要用于消息发送
        // 游戏发言
        this.msgListAll = new Array(); // 总发言记录
        this.msgListNow = new Array(); // 当前发言记录
        this.speakTime = 20; // 发言时间 设定 单位 秒
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
            this.gameInit();
            this.setPlayer();
            var dataOut = new data_1.Data("gamestart");
            dataOut.playerList = this.playerList;
            dataOut.fascistCount = this.fascistCount;
            dataOut.proIndex = this.proIndex;
            dataOut.proList = this.proList;
            dataOut.started = this.started;
            dataOut.speakTime = this.speakTime;
            dataOut.user = server_1.userService.socketIdToUser[socketId];
            dataOut.msg = new data_2.Msg("system", "游戏开始");
            myEmitter_1.myEmitter.emit("Send_Sth", dataOut);
            this.selectPre(this.playerList[Math.floor(Math.random() * this.playerList.length)]);
        }
    };
    /**
     * 玩家分配身份
     * 每一名玩家独立发送 身份消息
     */
    Game.prototype.setPlayer = function () {
        console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
        var tmp;
        this.playerList.filter(function (t) { t.seatNo = Math.random(); });
        this.playerList.sort(function (a, b) { return a.seatNo - b.seatNo; });
        this.hitler = this.playerList[0];
        this.hitler.role = "Hitler";
        var hitData = new data_1.Data("role", this.hitler);
        hitData.role = "Hitler";
        if (this.playerList.length <= 6) {
            hitData.other = this.fascist;
        }
        for (var i = 1; i <= this.fascistCount; i++) {
            this.fascist.push(this.playerList[i]);
            this.playerList[i].role = "Fascist";
        }
        for (var i = 1; i <= this.fascistCount; i++) {
            tmp = new data_1.Data("role", this.playerList[i]);
            tmp.role = "Fascist";
            tmp.other = this.fascist;
            tmp.target = this.hitler;
            myEmitter_1.myEmitter.emit("Send_Sth", tmp);
        }
        myEmitter_1.myEmitter.emit("Send_Sth", hitData);
        for (var i = this.fascistCount + 1; i < this.playerList.length; i++) {
            this.liberal.push(this.playerList[i]);
            this.playerList[i].role = "Liberal";
            tmp = new data_1.Data("role", this.playerList[i]);
            tmp.role = "Liberal";
            myEmitter_1.myEmitter.emit("Send_Sth", tmp);
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
    /**
     * 选择游戏板
     * 无通知
     */
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
        data.msg = new data_2.Msg("system", "法案牌堆和弃牌堆重新洗混了");
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    /**
     * 选总统，一轮结束后继续游戏的象征
     * 通知玩家
     */
    Game.prototype.selectPre = function (player, next) {
        if (this.prm) {
            this.prm.isPrm = false;
        }
        this.playerList.filter(function (t) { t.isPre = false; });
        if (this.pre) {
            this.pre.isPre = false;
        }
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
        else { }
        console.log("本届总统是", this.pre.name);
        // console.log("下届总统是", this.prenext.name);
        // 处理是否可选问题
        var playerSurvival = this.playerList.filter(function (t) {
            return t.isSurvival;
        }).length;
        // console.log("当前存活人数", playerSurvival);
        if (playerSurvival > 5) {
            // console.log("人数大于5");
            this.playerList.filter(function (t) {
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
            this.playerList.filter(function (t) {
                if (t.isLastPrm) {
                    t.canBeSelect = false;
                }
                else {
                    t.canBeSelect = true;
                }
            });
        }
        var data = new data_1.Data("selectPrm");
        data.playerList = this.playerList;
        data.pre = this.pre;
        data.msg = new data_2.Msg("choosePlayer", "等待总统 " + this.pre.name + " 选总理..", "selectPrm", true);
        myEmitter_1.myEmitter.emit("Send_Sth", data);
    };
    // 设定总理
    Game.prototype.setPrm = function (user) {
        // 待投票总理
        this.prmTmp = server_1.userService.socketIdToUser[user.socketId];
        this.prmTmp.isPrm = true;
        console.log(Date().toString().slice(15, 25), "创建新投票");
        this.setVote();
        var data0 = new data_1.Data("updata");
        data0.msg = new data_2.Msg("choosePlayer", "总统选择了 " + this.prmTmp.name, "selectPrm", false, this.prmTmp);
        myEmitter_1.myEmitter.emit("Send_Sth", data0);
        var data = new data_1.Data("pleaseVote");
        data.playerList = this.playerList;
        data.prmTmp = this.prmTmp;
        data.pre = this.pre;
        data.voteCount = this.voteCount;
        data.nowVote = this.nowVote;
        data.msg = new data_2.Msg("player_vote", "总统 " + this.pre.name + "  总理 " + this.prmTmp.name + " 请投票..", "player_vote", true);
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
        var data = new data_1.Data("pleaseVote");
        this.nowVote[server_1.userService.socketIdToUser[sockeId].seatNo - 1] = res;
        this.voteCount = this.voteCount + 1;
        data.nowVote = this.nowVote;
        data.msg = new data_2.Msg("my_vote", server_1.userService.socketIdToUser[sockeId].name + "投票了");
        myEmitter_1.myEmitter.emit("Send_Sth", data);
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
                    data.msg = new data_2.Msg("system", "同意票超过半数，政府成立,希特勒在危机时刻上任总理，游戏结束，红色胜利");
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                }
                else {
                    if (this.prm) {
                        this.prm.isPrm = false;
                    }
                    this.prm = this.prmTmp;
                    this.prm.isPrm = true;
                    data.prm = this.prm;
                    data.msg = new data_2.Msg("system", "同意票超过半数，政府成立,等待总统 " + this.pre.name + " 选提案");
                    data.voteRes = 1;
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    this.findPro();
                }
            }
            else {
                // 失败
                this.prmTmp.isPrm = false;
                data.voteRes = 0;
                this.failTimes = this.failTimes + 1;
                if (this.failTimes === 3) {
                    // 强制生效
                    data.msg = new data_2.Msg("system", "同意票未超过半数，政府组建失败，连续三次组建政府失败，法案强制生效一张");
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    this.proEff(this.proList[this.proIndex], true);
                }
                else {
                    data.msg = new data_2.Msg("system", "同意票未超过半数，政府组建失败，切换下任总统候选");
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                    // say 不发言直接下一届政府
                    this.selectPre(this.prenext);
                }
            }
        }
        else {
            console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
        }
    };
    Game.prototype.veto_all = function () {
        var _this = this;
        // todo 通知玩家
        var data = new data_1.Data("veto_all");
        data.msg = new data_2.Msg("system", "政府已经放弃掉了本次的三次法案，然后宣布本届政府组建失败");
        this.failTimes = this.failTimes + 1;
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
    // //  法案选择
    // proSelect1(proDiscard: number, list: Array<number>) {
    //   console.log("待选牌堆" + list.length + "张");
    //   if (list.length === 3) {
    //     list.splice(list.indexOf(proDiscard), 1); // 从待选牌堆删除该法案
    //     this.findPro(list);
    //   } else {
    //     list.splice(list.indexOf(proDiscard), 1); // 从待选牌堆删除该法案
    //     console.log("待选牌堆" + list);
    //     this.proEff(list[0]); // 法案生效
    //   }
    // }
    //
    //
    // // 选法案，list为空则为总统，list有内容则为总理
    // findPro1(list?: Array<number>) {
    //   let body = new Array<any>();
    //   body[0] = "x";
    //   body[1] = "x";
    //   body[2] = "x";
    //   if (!list) {
    //     console.log("总统选提案");
    //     let proTmp = [];
    //     console.log("牌堆顶位置编号" + this.proIndex);
    //     if (this.proIndex < 2) {
    //       console.log("牌堆数量不足");
    //       this.shuffle();
    //     }
    //     // 摸牌
    //     for (let n = this.proIndex; n >= this.proIndex - 2; n--) {
    //       proTmp.push(this.proList[n]);
    //     };
    //     this.proIndex = this.proIndex - 3; // 摸三张后牌堆顶变换
    //     this.proX3List = proTmp;
    //     console.log("摸牌之后牌堆顶位置编号" + this.proIndex);
    //     console.log("待选法案堆" + proTmp);
    //     let data = new Data("choosePro");
    //     data.msg = new Msg("playerCP", "等待总统选提案", "prechoose");
    //     data.proIndex = this.proIndex;
    //     myEmitter.emit("Send_Sth", data);
    //     let data2 = new Data("choosePro", this.pre);
    //     body[0] = this.proX3List;
    //     data2.msg = new Msg("playerCP", body, "you_pre");
    //     data2.proX3List = this.proX3List;
    //     myEmitter.emit("Send_Sth", data2);
    //   } else {
    //     // 通知普通玩家
    //     this.proX3List = list;
    //     body[1] = this.proX3List;
    //     if (this.proEffRed === 5) {
    //       // todo
    //       console.log("通知普通玩家总理选提案");
    //       let data = new Data("choosePro2");
    //       data.msg = new Msg("system", "总统弃掉了一张卡片，等待总理 " + this.prm.name + " 选提案");
    //       data.proList = this.proList;
    //       data.proIndex = this.proIndex;
    //       myEmitter.emit("Send_Sth", data);
    //       console.log("总理选提案（否决权）");
    //       let data2 = new Data("choosePro2", this.prm);
    //       data2.proX3List = this.proX3List;
    //       myEmitter.emit("Send_Sth", data2);
    //     } else {
    //       console.log("通知普通玩家总理选提案");
    //       let data = new Data("choosePro");
    //       data.msg = new Msg("system", "等待总理 " + this.prm.name + " 选提案..");
    //       data.proList = this.proList;
    //       data.proIndex = this.proIndex;
    //       myEmitter.emit("Send_Sth", data);
    //       console.log("总理选提案(普通)");
    //       let data2 = new Data("choosePro", this.prm);
    //       data2.msg = new Msg("playerCP", "等待总统选提案", "you_prm");
    //       data2.proX3List = this.proX3List;
    //       myEmitter.emit("Send_Sth", data2);
    //     }
    //   }
    // }
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
            this.proX3List[0] = proTmp;
            this.proX3ListHide[0] = ["x", "x", "x"];
            // -----pre_CP----
            var data = new data_1.Data("choosePro");
            data.msg = new data_2.Msg("playerCP", this.proX3ListHide, "pre_CP", this.proX3List);
            data.proIndex = this.proIndex;
            myEmitter_1.myEmitter.emit("Send_Sth", data);
        }
        else {
            console.log("列表", list);
            console.log("弃牌", proDiscard);
            console.log("弃牌", list.length);
            if (list[0].length === 3) {
                // -----prm_CP----
                list[0].splice(list[0].indexOf(proDiscard), 1); // 从待选牌堆删除该法案
                list[1] = list[0];
                list[0] = [proDiscard];
                this.proX3List = list;
                this.proX3ListHide[0] = ["x"];
                this.proX3ListHide[1] = ["x", "x"];
                if (this.proEffRed < 5) {
                    // -----无否决权
                    var data = new data_1.Data("choosePro");
                    data.msg = new data_2.Msg("playerCP", this.proX3ListHide, "prm_CP", this.proX3List);
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
                }
                else {
                }
            }
            else {
                //  ------CP_end--------生效过程
                list[1].splice(list[1].indexOf(proDiscard), 1); // 从待选牌堆删除该法案
                list[2] = list[1];
                list[1] = [proDiscard];
                this.proX3List = list;
                this.proX3ListHide[1] = ["x"];
                this.proX3ListHide[2] = ["x"];
                var data = new data_1.Data("choosePro");
                data.msg = new data_2.Msg("playerCP", this.proX3ListHide, "end_CP", this.proX3List);
                myEmitter_1.myEmitter.emit("Send_Sth", data);
                this.proEff(list[2][0]); // 法案生效
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
                            data.msg = new data_2.Msg("system", "红色提案生效");
                            this.proEffRed = this.proEffRed + 1;
                        }
                        else {
                            console.log("蓝色提案生效");
                            data.msg = new data_2.Msg("system", "蓝色提案生效");
                            this.proEffBlue = this.proEffBlue + 1;
                        }
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
                        data2.msg = new data_2.Msg("system", "6张红色法案生效，法西斯阵营胜利");
                        myEmitter_1.myEmitter.emit("Send_Sth", data2);
                        this.gameover("游戏结束，红色胜利");
                        return [3 /*break*/, 5];
                    case 1:
                        if (!(this.proEffBlue === 5))
                            return [3 /*break*/, 2];
                        this.started = false;
                        console.log("蓝方胜利");
                        //   todo:结算
                        console.log("游戏结束");
                        this.gameover("游戏结束，蓝色胜利");
                        data2.msg = new data_2.Msg("system", "5张蓝色法案生效，自由党阵营胜利");
                        myEmitter_1.myEmitter.emit("Send_Sth", data2);
                        return [3 /*break*/, 5];
                    case 2:
                        this.proList.splice(this.proList.indexOf(pro), 1); // 从总牌堆删除生效法案
                        for (n in this.playerList) {
                            this.playerList[n].isLastPre = false;
                            this.playerList[n].isLastPrm = false;
                        } // 上届政府标记归零
                        if (!force) {
                            // 普通生效，变更政府标记
                            this.pre.isLastPre = true;
                            this.prm.isLastPrm = true;
                        }
                        else {
                            // 强制生效时，牌堆顶摸走一张
                            this.proIndex = this.proIndex - 1;
                        }
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
                            msgDataToAll.msg = new data_2.Msg("system", "玩家顺序发言结束");
                            myEmitter_1.myEmitter.emit("Send_Sth", msgDataToAll);
                            _this.selectPre(_this.prenext); // 切换总统 继续游戏
                        });
                        _a.label = 5;
                    case 5: return [2 /*return*/];
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
            var data, data2, data3;
            return __generator(this, function (_a) {
                console.log("调查身份");
                if (typeof player === "undefined") {
                    console.log("通知总统 调查身份");
                    data = new data_1.Data("invPlayer");
                    data.msg = new data_2.Msg("system", "等待总统调查身份");
                    myEmitter_1.myEmitter.emit("Send_Sth", data);
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
                    data3.msg = new data_2.Msg("system", "总统成功调查了 " + player.name + " 的身份");
                    myEmitter_1.myEmitter.emit("Send_Sth", data3);
                    // todo 玩家确认过程
                    setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 0);
                }
                return [2 /*return*/];
            });
        });
    };
    // 技能：指定总统
    Game.prototype.preSelect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tmp, data;
            return __generator(this, function (_a) {
                console.log("指定总统");
                tmp = new Array();
                data = new data_1.Data("preSelect");
                data.msg = new data_2.Msg("choosePlayer", "等待总统 " + this.pre.name + " 执行权利：指定下任总统..", "preSelect");
                myEmitter_1.myEmitter.emit("Send_Sth", data);
                setTimeout(function () { myEmitter_1.myEmitter.emit("skill_is_done"); }, 0);
                return [2 /*return*/];
            });
        });
    };
    // 技能：枪决
    Game.prototype.toKill = function (player) {
        console.log("枪决");
        // 杀人动作
        if (typeof player === "undefined") {
            // 通知杀人列表
            var data = new data_1.Data("toKill");
            data.msg = new data_2.Msg("choosePlayer", "等待总统 " + this.pre.name + " 执行权利：决定枪决的目标", "toKill");
            myEmitter_1.myEmitter.emit("Send_Sth", data);
        }
        else {
            // 结算杀人选择
            // 从玩家状态修改
            player = server_1.userService.socketIdToUser[player.socketId];
            player.isSurvival = false;
            var data = new data_1.Data("toKill");
            data.target = player;
            data.playerList = this.playerList;
            data.msg = new data_2.Msg("system", "总统枪决了 " + player.name);
            myEmitter_1.myEmitter.emit("Send_Sth", data);
            player = server_1.userService.socketIdToUser[player.socketId];
            if (player.role === "Hitler") {
                console.log("游戏结束");
                data.msg = new data_2.Msg("system", "总统枪决的人是希特勒 游戏结束，自由党胜利");
                this.gameover("游戏结束，蓝色胜利");
            }
            else {
                // 枪毙的是下届总统时，切换下届总统
                if (this.prenext.socketId === player.socketId) {
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
        data2.msg = new data_2.Msg("system", "总统执行了权利：查看了接下来的三张法案牌");
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
        this.proIndex = 16; // 牌堆顶
        this.voteList = new Array(); // 投票总记录
        this.fascist = new Array();
        this.liberal = new Array();
        this.voteRes = 0;
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
        this.failTimes = 0; // 政府组件失败次数
        this.isVoted = false;
        //  ------------ 数据初始化end
        this.shuffle();
        this.selectGame();
    };
    return Game;
}());
exports.Game = Game;
