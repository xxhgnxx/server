import { userService } from "../server";
import { User } from "../user";
import { Data } from "../server";
import { getdate } from "../user/user.service";


export class Game {
    skillList = new Array<Function | string>();  // 技能列表
    proList = new Array<any>();  // 法案牌堆
    proIndex = 16; // 牌堆顶
    proX3List: Array<number>; // 法案牌摸的三张牌
    started: boolean = false;       // 游戏是否开始
    playerList = new Array<User>(); // 加入本次游戏的玩家列表，主要用于消息发送

    proEffBlue = 0; // 法案生效数
    proEffRed = 0; // 法案生效数
    failTimes = 0; // 政府组件失败次数
    fascistCount: number; // 法西斯玩家数量
    liberalCount: number; // 自由党玩家数量
    voteList = new Array<Array<number>>(); // 投票总记录
    nowVote: Array<number>; // 当前正在进行的投票
    voteRes: number = 0; // 投票结果
    voteCount: number;  //  投票数量
    lastPre: User;
    lastPrm: User;
    pre: User;
    prenext: User;
    prm: User;
    hitler: User;
    fascist: Array<User>;
    liberal: Array<User>;
    start() {
        if (this.playerList.length < 5) {
            console.log("人数不足：", this.playerList.length);
        } else {
            console.log("游戏开始", this.playerList.length);
            this.selectGame();
            this.setPlayer();
            this.makePro();
            this.shuffle();
            this.started = true;

        }
    }
    setPlayer() {
        console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].role = "liberal";
        }
        this.playerList.filter(t => { t.seatNo = Math.random(); });
        this.playerList.sort((a, b) => { return a.seatNo - b.seatNo; });
        this.playerList[0].role = "Hitler";
        this.playerList[0].isHitler = true;
        for (let i = 1; i <= this.fascistCount; i++) {
            this.playerList[i].role = "Fascist";
            this.playerList[i].isFascist = true;
        }
        this.playerList.filter(t => { t.seatNo = Math.random(); });
        this.playerList.sort((a, b) => { return a.seatNo - b.seatNo; });
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].seatNo = i + 1;
        }

    }

    makePro() {
        // 法案牌生成
        console.log("提案牌堆生成");
        for (let i = 0; i <= 16; i++) {
            this.proList.push(i);
        }
        console.log(this.proList);
    }

    // 3种游戏模式选择
    selectGame() {
        console.log("根据人数选择本局游戏规则");
        let plyaerCount = this.playerList.length;
        if (plyaerCount >= 9) {
            console.log("选择9-10人游戏");
            this.fascistCount = 3;
            this.skillList[0] = this.invPlayer;
            this.skillList[1] = this.invPlayer;
            this.skillList[2] = this.setPre;
            this.skillList[3] = this.toKill;
            this.skillList[4] = this.toKill;
        } else {
            if (plyaerCount >= 7) {
                this.fascistCount = 2;
                console.log("选择7-8人游戏");
                this.skillList[0] = "x";
                this.skillList[1] = this.invPlayer;
                this.skillList[2] = this.setPre;
                this.skillList[3] = this.toKill;
                this.skillList[4] = this.toKill;
            } else {
                if (plyaerCount >= 5) {
                    this.fascistCount = 1;
                    console.log("选择5-6人游戏");
                    this.skillList[0] = "x";
                    this.skillList[1] = "x";
                    this.skillList[2] = this.toLookPro;
                    this.skillList[3] = this.toKill;
                    this.skillList[4] = this.toKill;
                } else {
                    console.log("人数不足");
                }
            }
        }
        this.liberalCount = plyaerCount - 1 - this.fascistCount;
    }
    setPro() { }


    // 提案牌洗牌
    shuffle() {
        console.log("提案洗牌");
        this.proIndex = this.proList.length - 1; // 牌堆顶
        let mytmp = new Array();
        console.log("提案牌堆" + this.proList.length + "张");
        for (let i = 0; i <= 16; i++) {
            mytmp.push(Math.random());
        }
        this.proList.sort((a, b) => {
            return mytmp[a] - mytmp[b];
        });
        console.log(this.proList);
    }

    // 选总统，一轮结束后继续游戏的象征
    selectPre(player: User) {
        // if (pre) {pre.canbeselect="true";};
        this.playerList.filter(t => { t.isPre = false; });
        this.pre = player;
        this.pre.isPre = true;
        if (this.playerList[this.playerList.indexOf(player) + 1]) {
            this.prenext = this.playerList[this.playerList.indexOf(player) + 1];
        } else {
            this.prenext = this.playerList[0];
        };
        console.log("本届总统是", this.pre.name);
        console.log("下届总统是", this.prenext.name);
        // 投票数归零


    }

    // 设定总理
    setPrm(user: User) {
        this.prm = this.playerList.filter(t => { return t.socketId === user.socketId; })[0];
        this.prm.isPrm = true;
    }
    effPro() { }

    // 发起投票
    setVote() {
        let tmp = new Array<number>();
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].isSurvival) {
                tmp[this.playerList[i].seatNo - 1] = 0;
            }
        }
        this.voteList.push(tmp);
        this.nowVote = tmp;
        this.voteCount = 0;
        this.voteRes = 0;
    }

    // 结算投票
    getVote(seatNo: number, res: number): boolean {
        this.nowVote[seatNo] = res;
        this.voteCount = this.voteCount + 1;
        if (this.voteCount === this.nowVote.length) {
            for (let i = 0; i < this.nowVote.length; i++) {
                this.voteRes = this.voteRes + this.nowVote[i];
            }
            return true;
        } else {
            console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
            return false;
        }

    }

    // 选法案，list为空则为总统，list有内容则为总理
    findPro(list: Array<number>) {
        if (!list) {
            console.log("总统选提案");
            let proTmp = [];
            console.log("牌堆顶位置编号" + this.proIndex);
            if (this.proIndex < 2) {
                console.log("牌堆数量不足");
                this.shuffle();
            }
            // 摸牌
            for (let n = this.proIndex; n >= this.proIndex - 2; n--) {
                proTmp.push(this.proList[n]);
            };
            this.proIndex = this.proIndex - 3; // 摸三张后牌堆顶变换
            this.proX3List = proTmp;
            console.log("摸牌之后牌堆顶位置编号" + this.proIndex);
            console.log("待选法案堆" + proTmp);
        } else {
            this.proX3List = list;
            console.log("总理选提案");
        }
    }





    preSelect() { }
    prmSelect() { }
    proSelect() { }
    tmp() { }
    back() { }

    // 游戏状态，是否开始，影响到能否加入游戏等


    // 技能：调查身份
    invPlayer() {
        // console.log("总统 调查身份");
        // let list = gamePlayer.filter(t => {
        //     return t.name !== pre.name;
        // });
        // sthToDo(user, "msgSystem", "等待总统进行身份调查", "gameMsg");
        // socketlist[pre.name].emit("invPlayer", list);
    }
    // 技能：指定总统
    setPre() {
        // console.log("总统 指定总统");
        // let list = gamePlayer.filter(t => {
        //     return t.name !== pre.name;
        // });
        // sthToDo(user, "msgSystem", "等待总统指定下一任总统", "gameMsg");
        // socketlist[pre.name].emit("nextPre", list);
    }
    // 技能：枪决
    toKill() {
        // console.log("总统 枪决一人");
        // let list = gamePlayer.filter(t => {
        //     return t.name !== pre.name;
        // });
        // sthToDo(user, "msgSystem", "等待总统决定枪决目标", "gameMsg");
        // socketlist[pre.name].emit("killPlayer", list);
        // console.log("被枪决玩家需要取消操作权限..待添加");
    }
    // 技能：查看法案
    toLookPro() {
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
    }
    // 政府组建失败处理，调用proEff，t=1
    failSystem() {
        // failTimes = failTimes + 1;
        // if (failTimes === 3) {
        //     let msg = "连续三次组建政府失败，强行执行法案牌的第一张法案,";
        //     sthToDo(user, "msgSystem", msg, "gameMsg");
        //     proEff(proList[proIndex], 1);
        // } else {
        //     selectPre(prenext);
        // }
    }
    // 游戏结束，获胜方wingroup，获胜原因reason
    gameOver(wingroup, reason) {
        // sthToDo(gamePlayer, "msgSystem", "游戏结束", "msgPop");
        // let msg = reason + wingroup;
        // sthToDo(user, "msgSystem", msg, "gameMsg");
    }


    constructor() {

    }
}
