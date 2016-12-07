"use strict";
var vote_1 = require("./vote");
var Game = (function () {
    function Game() {
        this.skillList = new Array(); // 技能列表
        this.proList = new Array(); // 法案牌堆
        this.started = false; // 游戏是否开始
        this.playerList = new Array(); // 加入本次游戏的玩家列表，主要用于消息发送
        this.proIndex = 16; // 牌堆顶
        this.proEffBlue = 0; // 法案生效数
        this.proEffRed = 0; // 法案生效数
        this.failTimes = 0; // 政府组件失败次数
    }
    Game.prototype.start = function () {
        if (this.playerList.length < 5) {
            console.log("人数不足：", this.playerList.length);
        }
        else {
            console.log("游戏开始", this.playerList.length);
            this.selectGame();
            this.setPlayer();
            this.makePro();
            this.Shuffle();
            this.started = true;
            this.selectPre(this.playerList[Math.floor(Math.random() * this.playerList.length)]);
        }
    };
    Game.prototype.setPlayer = function () {
        console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
        for (var i = 0; i < this.playerList.length; i++) {
            this.playerList[i].role = "liberal";
        }
        this.playerList.filter(function (t) { t.seatNo = Math.random(); });
        this.playerList.sort(function (a, b) { return a.seatNo - b.seatNo; });
        this.playerList[0].role = "Hitler";
        this.playerList[0].isHitler = true;
        for (var i = 1; i <= this.fascistCount; i++) {
            this.playerList[i].role = "Fascist";
            this.playerList[i].isFascist = true;
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
            this.skillList[0] = this.invPlayer;
            this.skillList[1] = this.invPlayer;
            this.skillList[2] = this.setPre;
            this.skillList[3] = this.toKill;
            this.skillList[4] = this.toKill;
        }
        else {
            if (plyaerCount >= 7) {
                this.fascistCount = 2;
                console.log("选择7-8人游戏");
                this.skillList[0] = "x";
                this.skillList[1] = this.invPlayer;
                this.skillList[2] = this.setPre;
                this.skillList[3] = this.toKill;
                this.skillList[4] = this.toKill;
            }
            else {
                if (plyaerCount >= 5) {
                    this.fascistCount = 1;
                    console.log("选择5-6人游戏");
                    this.skillList[0] = "x";
                    this.skillList[1] = "x";
                    this.skillList[2] = this.toLookPro;
                    this.skillList[3] = this.toKill;
                    this.skillList[4] = this.toKill;
                }
                else {
                    console.log("人数不足");
                }
            }
        }
        this.liberalCount = plyaerCount - 1 - this.fascistCount;
    };
    Game.prototype.setPro = function () { };
    // 提案牌洗牌
    Game.prototype.Shuffle = function () {
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
    Game.prototype.selectPre = function (player) {
        // if (pre) {pre.canbeselect="true";};
        this.playerList.filter(function (t) { t.isPre = false; });
        this.pre = player;
        this.pre.isPre = true;
        if (this.playerList[this.playerList.indexOf(player) + 1]) {
            this.prenext = this.playerList[this.playerList.indexOf(player) + 1];
        }
        else {
            this.prenext = this.playerList[0];
        }
        ;
        console.log("本届总统是", this.pre.name);
        console.log("下届总统是", this.prenext.name);
        // 投票数归零
    };
    Game.prototype.setPrm = function () { };
    Game.prototype.effPro = function () { };
    // 发起投票
    Game.prototype.vote = function () {
        this.voteList.push(new vote_1.Vote(this.playerList));
    };
    Game.prototype.preSelect = function () { };
    Game.prototype.prmSelect = function () { };
    Game.prototype.proSelect = function () { };
    Game.prototype.tmp = function () { };
    Game.prototype.back = function () { };
    // 游戏状态，是否开始，影响到能否加入游戏等
    // 技能：调查身份
    Game.prototype.invPlayer = function () {
        // console.log("总统 调查身份");
        // let list = gamePlayer.filter(t => {
        //     return t.name !== pre.name;
        // });
        // sthToDo(user, "msgSystem", "等待总统进行身份调查", "gameMsg");
        // socketlist[pre.name].emit("invPlayer", list);
    };
    // 技能：指定总统
    Game.prototype.setPre = function () {
        // console.log("总统 指定总统");
        // let list = gamePlayer.filter(t => {
        //     return t.name !== pre.name;
        // });
        // sthToDo(user, "msgSystem", "等待总统指定下一任总统", "gameMsg");
        // socketlist[pre.name].emit("nextPre", list);
    };
    // 技能：枪决
    Game.prototype.toKill = function () {
        // console.log("总统 枪决一人");
        // let list = gamePlayer.filter(t => {
        //     return t.name !== pre.name;
        // });
        // sthToDo(user, "msgSystem", "等待总统决定枪决目标", "gameMsg");
        // socketlist[pre.name].emit("killPlayer", list);
        // console.log("被枪决玩家需要取消操作权限..待添加");
    };
    // 技能：查看法案
    Game.prototype.toLookPro = function () {
        // console.log("总统 查看三张法案");
        // sthToDo(user, "msgSystem", "总统查看了接下来的三张法案", "gameMsg");
        // let msg = "法案牌堆顶依次是: ";
        // for (i = 0; i <= 2; i++) {
        //     if (proList[proIndex - i] >= 6) {
        //         msg = msg + "红色法案 ";
        //     } else {
        //         msg = msg + "蓝色法案 ";
        //     }
        // }
        // socketlist[pre.name].emit("invRes", msg);
        // selectPre(prenext);
    };
    // 政府组建失败处理，调用proEff，t=1
    Game.prototype.failSystem = function () {
        // failTimes = failTimes + 1;
        // if (failTimes === 3) {
        //     let msg = "连续三次组建政府失败，强行执行法案牌的第一张法案,";
        //     sthToDo(user, "msgSystem", msg, "gameMsg");
        //     proEff(proList[proIndex], 1);
        // } else {
        //     selectPre(prenext);
        // }
    };
    // 游戏结束，获胜方wingroup，获胜原因reason
    Game.prototype.gameOver = function (wingroup, reason) {
        // sthToDo(gamePlayer, "msgSystem", "游戏结束", "msgPop");
        // let msg = reason + wingroup;
        // sthToDo(user, "msgSystem", msg, "gameMsg");
    };
    return Game;
}());
exports.Game = Game;
