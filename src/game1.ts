import { userService } from "./server";
import { User } from "./user";
import { Data } from "./data";
import { MsgData } from "./msgData";
// import { getdate } from "./userService";
import { myEmitter } from "./myEmitter";


export class Game {
    // skillList = new Array<Function | string>();  // 技能列表
    skillList: Array<Function>;  // 技能列表
    proList: Array<any>;  // 法案牌堆
    proIndex: number; // 牌堆顶
    proX3List: Array<number>; // 法案牌摸的三张牌
    started: boolean = false;       // 游戏是否开始
    playerList = new Array<User>(); // 加入本次游戏的玩家列表，主要用于消息发送
    pro: number; // 生效法案

    proEffBlue: number; // 法案生效数
    proEffRed: number; // 法案生效数
    failTimes: number; // 政府组件失败次数
    fascistCount: number; // 法西斯玩家数量
    liberalCount: number; // 自由党玩家数量

    isVoted: boolean;
    voteList: Array<Array<number>>; // 投票总记录
    nowVote: Array<number>; // 当前正在进行的投票
    voteRes: number; // 投票结果
    voteCount: number;  //  投票数量

    lastPre: User;
    lastPrm: User;
    pre: User;
    prenext: User;
    prm: User;
    prmTmp: User;  // 待投票的总理

    hitler: User;
    fascist: Array<User>;
    liberal: Array<User>;

    // 游戏发言
    msgListAll = new Array<any>(); // 总发言记录
    msgListNow = new Array<any>(); // 当前发言记录
    speakTime: number = 120;  // 发言时间 设定 单位 秒

    start(socketId) {
        this.playerList = userService.userList.filter(t => {
            return t.isSeat === true;
        });
        if (this.playerList.length < 5) {
            console.log("人数不足：", this.playerList.length);
            return false;
        } else {
            console.log("游戏开始", this.playerList.length);
            //  ------------ 数据初始化start
            this.started = true;
            this.skillList = new Array<Function>();
            this.proList = new Array<any>();  // 法案牌堆
            this.proIndex = 16; // 牌堆顶
            this.voteList = new Array<Array<number>>(); // 投票总记录
            this.fascist = new Array<User>();
            this.liberal = new Array<User>();
            this.voteRes = 0;
            this.proEffBlue = 0; // 法案生效数
            this.proEffRed = 0; // 法案生效数
            this.failTimes = 0; // 政府组件失败次数
            this.isVoted = false;
            //  ------------ 数据初始化end
            this.selectGame();
            this.makePro();
            this.shuffle();
            this.setPlayer();
            let dataOut = new Data();
            dataOut.playerList = this.playerList;
            dataOut.fascistCount = this.fascistCount;
            dataOut.proIndex = this.proIndex;
            dataOut.proList = this.proList;
            dataOut.started = this.started;
            dataOut.user = userService.socketIdToUser[socketId];
            dataOut.type = "gamestart";
            dataOut.toWho = this.playerList;
            dataOut.gameMsg = "游戏开始";
            myEmitter.emit("Send_Sth", dataOut);
            this.selectPre(this.playerList[Math.floor(Math.random() * this.playerList.length)]);
        }
    }

    setPlayer() {
        console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
        let tmp;
        this.playerList.filter(t => { t.seatNo = Math.random(); });
        this.playerList.sort((a, b) => { return a.seatNo - b.seatNo; });
        this.hitler = this.playerList[0];
        this.hitler.role = "Hitler";
        let hitData = new Data();
        hitData.toWho = this.hitler;
        hitData.type = "role";
        hitData.role = "Hitler";
        if (this.playerList.length <= 6) {
            hitData.other = this.fascist;
        }
        for (let i = 1; i <= this.fascistCount; i++) {
            this.fascist.push(this.playerList[i]);
            this.playerList[i].role = "Fascist";
        }
        for (let i = 1; i <= this.fascistCount; i++) {
            tmp = new Data();
            tmp.type = "role";
            tmp.role = "Fascist";
            tmp.toWho = this.playerList[i];
            tmp.other = this.fascist;
            tmp.target = this.hitler;
            myEmitter.emit("Send_Sth", tmp);
        }
        myEmitter.emit("Send_Sth", hitData);
        console.log();
        for (let i = this.fascistCount + 1; i < this.playerList.length; i++) {
            this.liberal.push(this.playerList[i]);
            this.playerList[i].role = "Liberal";
            tmp = new Data();
            tmp.type = "role";
            tmp.role = "Liberal";
            tmp.toWho = this.playerList[i];
            myEmitter.emit("Send_Sth", tmp);
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
            this.skillList[0] = this.invPlayer.bind(this);
            this.skillList[1] = this.invPlayer.bind(this);
            this.skillList[2] = this.preSelect.bind(this);
            this.skillList[3] = this.toKill.bind(this);
            this.skillList[4] = this.toKill.bind(this);
        } else {
            if (plyaerCount >= 7) {
                this.fascistCount = 2;
                console.log("选择7-8人游戏");
                this.skillList[0] = this.nothing.bind(this);
                this.skillList[1] = this.invPlayer.bind(this);
                this.skillList[2] = this.preSelect.bind(this);
                this.skillList[3] = this.toKill.bind(this);
                this.skillList[4] = this.toKill.bind(this);
            } else {
                if (plyaerCount >= 5) {
                    this.fascistCount = 1;
                    console.log("选择5-6人游戏");
                    this.skillList[0] = this.nothing.bind(this);
                    this.skillList[1] = this.nothing.bind(this);
                    this.skillList[2] = this.toLookPro.bind(this);
                    this.skillList[3] = this.toKill.bind(this);
                    this.skillList[4] = this.toKill.bind(this);
                } else {
                    console.log("人数不足");
                }
            }
        }
        this.liberalCount = plyaerCount - 1 - this.fascistCount;
    }



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
    selectPre(player: User, next?: boolean) {
        // if (pre) {pre.canbeselect="true";};
        if (this.prm) {
            this.prm.isPrm = false;
        }
        this.playerList.filter(t => { t.isPre = false; });
        if (this.pre) {
            this.pre.isPre = false;
        }
        this.pre = userService.socketIdToUser[player.socketId];
        this.pre.isPre = true;

        if (!next) {
            // 顺序指定下届总统
            if (this.playerList[this.playerList.indexOf(player) + 1]) {
                this.prenext = this.playerList[this.playerList.indexOf(player) + 1];
            } else {
                this.prenext = this.playerList[0];
            };
        } else {


        }
        console.log("本届总统是", this.pre.name);
        console.log("下届总统是", this.prenext.name);

        // 处理是否可选问题
        let playerSurvival = this.playerList.filter(t => {
            return t.isSurvival;
        }).length;
        console.log("当前存活人数", playerSurvival);
        if (playerSurvival > 5) {
            console.log("人数大于5");
            this.playerList.filter(t => {
                if (t.isLastPrm || t.isLastPre) {
                    t.canBeSelect = false;
                } else {
                    t.canBeSelect = true;
                }
            });
        } else {
            // nothing
            console.log("人数小于等于5");
            this.playerList.filter(t => {
                if (t.isLastPrm) {
                    t.canBeSelect = false;
                } else {
                    t.canBeSelect = true;
                }
            });
        }
        let data = new Data();
        data.playerList = this.playerList;
        data.pre = this.pre;
        data.prenext = this.prenext;
        data.type = "selectPrm";
        data.toWho = this.playerList;
        data.gameMsg = "等待总统 " + this.pre.name + " 选总理..";
        myEmitter.emit("Send_Sth", data);
    }

    // 设定总理
    setPrm(user: User) {
        // 待投票总理
        this.prmTmp = userService.socketIdToUser[user.socketId];
        this.prmTmp.isPrm = true;
        console.log(Date().toString().slice(15, 25), "创建新投票");
        this.setVote();
        let data = new Data();
        data.toWho = this.playerList;
        data.type = "pleaseVote";
        data.playerList = this.playerList;
        data.prmTmp = this.prmTmp;
        data.pre = this.pre;
        data.voteCount = this.voteCount;
        data.nowVote = this.nowVote;
        data.gameMsg = "总统 " + this.pre.name + "  总理 " + this.prmTmp.name + " 请投票..";
        myEmitter.emit("Send_Sth", data);
    }



    // 发起投票
    setVote() {
        let tmp = new Array<number>();
        this.voteCount = 0;
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].isSurvival) {
                tmp[this.playerList[i].seatNo - 1] = 0;
            } else {
                tmp[this.playerList[i].seatNo - 1] = 4;
                this.voteCount = this.voteCount + 1;
            }
        }
        this.voteList.push(tmp);
        this.nowVote = tmp;
        this.isVoted = false;
        this.voteRes = 0;
    }

    // 结算投票
    getVote(sockeId: string, res: number) {

        let data = new Data();
        data.toWho = this.playerList;
        this.nowVote[userService.socketIdToUser[sockeId].seatNo - 1] = res;
        this.voteCount = this.voteCount + 1;
        if (this.voteCount === this.nowVote.length) {
            // 投票完成
            if (this.nowVote.filter(t => {
                return t === 2;
            }).length * 2 > this.nowVote.length - this.nowVote.filter(t => {
                return t === 4;
            }).length) {
                // 成功
                data.gameMsg = "同意票超过半数，政府成立,等待总统 " + this.pre.name + " 选提案";
                if (this.proEffRed >= 3 && this.prmTmp.role === "Hitler") {
                    //  总理生效 判断希特勒上位
                    console.log("游戏结束");
                    this.gameover("游戏结束，红色胜利");
                    data.gameMsg = "希特勒在危机时刻上任总理，游戏结束，红色胜利";
                    // todo
                } else {
                    if (this.prm) {
                        this.prm.isPrm = false;
                    }
                    this.prm = this.prmTmp;
                    this.prm.isPrm = true;
                    data.prm = this.prm;
                    data.voteRes = 1;

                    this.findPro();
                }
            } else {
                // 失败

                this.prmTmp.isPrm = false;
                data.voteRes = 0;
                this.failTimes = this.failTimes + 1;
                if (this.failTimes === 3) {
                    // 强制生效
                    data.gameMsg = "同意票未超过半数，政府组建失败，连续三次组建政府失败，法案强制生效一张";
                    myEmitter.emit("Send_Sth", data);
                    data.gameMsg = null;
                    this.proEff(this.proList[this.proIndex], true);
                } else {
                    data.gameMsg = "同意票未超过半数，政府组建失败，切换下任总统候选";
                    myEmitter.emit("Send_Sth", data);
                    delete data.gameMsg;
                    // say 不发言直接下一届政府
                    this.selectPre(this.prenext);
                }
            }
        } else {
            console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
        }
        data.type = "pleaseVote";
        data.nowVote = this.nowVote;
        data.toWho = this.playerList;
        myEmitter.emit("Send_Sth", data);
    }

    //  法案选择
    proSelect(proDiscard: number, list: Array<number>) {
        console.log("待选牌堆" + list.length + "张");
        if (list.length === 3) {
            list.splice(list.indexOf(proDiscard), 1); // 从待选牌堆删除该法案
            this.findPro(list);
        } else {
            list.splice(list.indexOf(proDiscard), 1); // 从待选牌堆删除该法案
            console.log("待选牌堆" + list);
            this.proEff(list[0]); // 法案生效
        }
    }

    veto_all() {
        // todo 通知玩家
        this.failTimes = this.failTimes + 1;
        if (this.failTimes === 3) {
            // 强制生效
            this.proEff(this.proList[this.proIndex], true);
        } else {
            // 发言
            myEmitter.emit("speak_start");
            myEmitter.once("speak_endAll", () => {

                this.selectPre(this.prenext); // 切换总统 继续游戏
            });

        }







    }





    // 选法案，list为空则为总统，list有内容则为总理
    findPro(list?: Array<number>) {
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
            let data = new Data;
            data.type = "choosePro";
            data.toWho = this.playerList.filter(t => {
                return t.isPre !== true;
            });
            data.gameMsg = "等待总统选提案";
            data.proIndex = this.proIndex;
            myEmitter.emit("Send_Sth", data);
            let data2 = new Data();
            data2.proX3List = this.proX3List;
            data2.type = "choosePro";
            data2.toWho = this.pre;
            myEmitter.emit("Send_Sth", data2);
        } else {
            // 通知普通玩家
            this.proX3List = list;

            if (this.proEffRed === 5) {
                console.log("通知普通玩家总理选提案");
                let data = new Data;
                data.type = "choosePro2";
                data.toWho = this.playerList.filter(t => {
                    return t.isPrm !== true;
                });
                data.gameMsg = "总统弃掉了一张卡片，等待总理 " + this.prm.name + " 选提案";
                data.proList = this.proList;
                data.proIndex = this.proIndex;
                myEmitter.emit("Send_Sth", data);
                console.log("总理选提案（否决权）");
                let data2 = new Data();
                data2.proX3List = this.proX3List;
                data2.type = "choosePro2";
                data2.toWho = this.prm;
                myEmitter.emit("Send_Sth", data2);
            } else {
                console.log("通知普通玩家总理选提案");
                let data = new Data;
                data.type = "choosePro";
                data.toWho = this.playerList.filter(t => {
                    return t.isPrm !== true;
                });
                data.gameMsg = "等待总理 " + this.prm.name + " 选提案..";
                data.proList = this.proList;
                data.proIndex = this.proIndex;
                myEmitter.emit("Send_Sth", data);
                console.log("总理选提案(普通)");
                let data2 = new Data();
                data2.proX3List = this.proX3List;
                data2.type = "choosePro";
                data2.toWho = this.prm;
                myEmitter.emit("Send_Sth", data2);
            }
        }
    }

    // 等待动作结算
    waitSth() {
        return new Promise(function(resolve) {
            myEmitter.once("skill_is_done", () => {
                console.log("动作完成");
                resolve();
            });
        });
    }



    async    proEff(pro: number, force?: boolean) {
        let data = new Data();
        this.failTimes = 0;
        this.pro = pro;
        console.log(pro);
        if (pro >= 6) {
            console.log("红色提案生效");
            data.gameMsg = "红色提案生效";
            this.proEffRed = this.proEffRed + 1;
        } else {
            console.log("蓝色提案生效");
            data.gameMsg = "蓝色提案生效";
            this.proEffBlue = this.proEffBlue + 1;
        }

        data.type = "proEff";
        data.pro = this.pro;
        data.proEffRed = this.proEffRed;
        data.proEffBlue = this.proEffBlue;
        data.toWho = this.playerList;
        myEmitter.emit("Send_Sth", data);
        data.gameMsg = null;

        if (this.proEffRed === 6) {
            this.started = false;
            console.log("红方胜利");
            //   todo:结算
            console.log("游戏结束");
            this.gameover("游戏结束，红色胜利");
            data.gameMsg = "6张红色法案生效，法西斯阵营胜利";
        } else {
            if (this.proEffBlue === 5) {
                this.started = false;
                console.log("蓝方胜利");
                //   todo:结算
                console.log("游戏结束");
                this.gameover("游戏结束，蓝色胜利");
                data.gameMsg = "5张蓝色法案生效，自由党阵营胜利";
            } else {
                this.proList.splice(this.proList.indexOf(pro), 1); // 从总牌堆删除生效法案
                for (let n in this.playerList) {
                    this.playerList[n].isLastPre = false;
                    this.playerList[n].isLastPrm = false;

                } // 上届政府标记归零
                if (!force) {
                    // 普通生效，变更政府标记
                    this.pre.isLastPre = true;
                    this.prm.isLastPrm = true;
                } else {
                    // 强制生效时，牌堆顶摸走一张
                    this.proIndex = this.proIndex - 1;
                }
                data.type = "proEff";
                data.proIndex = this.proIndex;
                data.proList = this.proList;
                data.toWho = this.playerList;
                myEmitter.emit("Send_Sth", data);

                if (pro >= 6) {
                    // 红色法案生效，执行技能
                    // test
                    console.log("执行技能");

                    this.skillList[this.proEffRed - 1]();
                    console.log("等待动作");
                    await this.waitSth();

                } else {
                    // 蓝色法案生效，无技能
                }
                myEmitter.emit("speak_start");
                myEmitter.once("speak_endAll", () => {
                    let msgDataToAll = new MsgData();
                    msgDataToAll.toWho = this.playerList;
                    msgDataToAll.gameMsg = "玩家顺序发言结束";
                    myEmitter.emit("Send_Sth", msgDataToAll);
                    this.selectPre(this.prenext); // 切换总统 继续游戏
                });
            }
        }





    }


    // 无技能
    nothing() {
        console.log("无技能");
        setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
    }

    // 技能：调查身份
    async    invPlayer(player?: User) {
        console.log("调查身份");

        if (typeof player === "undefined") {
            console.log("通知总统 调查身份");
            let data = new Data();
            data.type = "invPlayer";
            data.toWho = this.playerList;
            data.gameMsg = "等待总统调查身份";
            myEmitter.emit("Send_Sth", data);

        } else {
            console.log("告知调查结果");
            let data2 = new Data();
            data2.type = "invPlayer";
            if (this.liberal.filter(t => {
                return t.socketId === player.socketId;
            })[0]) {
                data2.other = "./pic/结果蓝.png";
            } else {
                data2.other = "./pic/结果红.png";
            }
            data2.target = player;
            data2.toWho = this.pre;
            myEmitter.emit("Send_Sth", data2);
            let data3 = new Data();
            data3.gameMsg = "总统成功调查了 " + player.name + " 的身份";
            data3.type = "通知";
            data3.toWho = this.playerList;
            myEmitter.emit("Send_Sth", data3);

            // todo 玩家确认过程
            setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
        }


    }
    // 技能：指定总统
    async    preSelect() {
        console.log("指定总统");
        let tmp = new Array<Data>();
        let data = new Data();
        data.type = "preSelect";
        data.toWho = this.playerList;
        data.gameMsg = "等待总统 " + this.pre.name + " 执行权利：指定下任总统..";
        myEmitter.emit("Send_Sth", data);

        setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
    }
    // 技能：枪决
    toKill(player?: User) {
        console.log("枪决");

        // 杀人动作
        if (typeof player === "undefined") {
            // 通知杀人列表
            let data = new Data();
            data.type = "toKill";
            data.toWho = this.playerList;
            data.gameMsg = "等待总统 " + this.pre.name + " 执行权利：决定枪决的目标";
            myEmitter.emit("Send_Sth", data);

        } else {
            // 结算杀人选择
            // 从玩家状态修改
            player = userService.socketIdToUser[player.socketId];
            player.isSurvival = false;
            let data = new Data();
            data.type = "toKill";
            data.target = player;
            data.playerList = this.playerList;
            data.toWho = this.playerList;
            data.gameMsg = "总统枪决了 " + player.name;
            myEmitter.emit("Send_Sth", data);
            player = userService.socketIdToUser[player.socketId];
            if (player.role === "Hitler") {
                console.log("游戏结束");
                data.gameMsg = "总统枪决的人是希特勒 游戏结束，自由党胜利";
                this.gameover("游戏结束，蓝色胜利");
                // todo
            } else {
                // 枪毙的是下届总统时，切换下届总统
                if (this.prenext === player) {
                    console.log("被枪决的玩家是下届总统");
                    if (this.playerList[this.playerList.indexOf(player) + 1]) {
                        console.log("被枪决的玩家不是队列末位");
                        this.prenext = this.playerList[this.playerList.indexOf(player) + 1];
                    } else {
                        console.log("被枪决的玩家是队列末位");
                        this.prenext = this.playerList[0];
                        console.log(this.prenext);
                    };
                }


            }
            setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
        }


    }
    // 技能：查看法案
    toLookPro() {
        console.log("查看法案");

        let data = new Data();
        data.type = "toLookPro";
        data.toWho = this.pre;
        data.proX3List = new Array<number>();
        for (let i = 0; i <= 2; i++) {
            data.proX3List.push(this.proList[this.proIndex - i]);
        }
        myEmitter.emit("Send_Sth", data);

        let data2 = new Data();
        data2.type = "通知";
        data2.toWho = this.playerList;
        data2.gameMsg = "总统执行了权利：查看了接下来的三张法案牌";
        myEmitter.emit("Send_Sth", data2);


        // todo 玩家查看法案时的确认过程
        setTimeout(() => { myEmitter.emit("skill_is_done"); }, 2000);
    }


    // gameOver
    gameover(res) {
        let tmp = new Array<Data>();
        let data = new Data();
        data.type = "gameover";
        data.toWho = this.playerList;
        data.other = res;
        myEmitter.emit("Send_Sth", data);

    }


    constructor() { }
}