import { userService } from "./server";
import { User } from "./user";
import { Data } from "./data";
import { MsgData } from "./data";
import { Msg } from "./data";
// import { getdate } from "./userService";
import { myEmitter } from "./myEmitter";


export class Game {
  // skillList = new Array<Function | string>();  // 技能列表
  skillList: Array<Function>;  // 技能列表
  proList: Array<any>;  // 法案牌堆
  proIndex: number; // 牌堆顶
  proX3List = new Array<any>(); // 法案牌摸的三张牌
  proX3ListHide = new Array<any>(); // 法案牌摸的三张牌平民模板
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
  speakTime: number = 20;  // 发言时间 设定 单位 秒


  lastTurn = new Map(); // 上一次政府情况
  start(socketId) {
    this.playerList = userService.userList.filter(t => {
      return t.isSeat === true;
    });
    if (this.playerList.length < 5) {
      console.log("人数不足：", this.playerList.length);
      return false;
    } else {
      console.log("游戏开始", this.playerList.length);
      this.gameInit();
      this.setPlayer();
      let dataOut = new Data("gamestart");
      dataOut.playerList = this.playerList;
      dataOut.fascistCount = this.fascistCount;
      dataOut.proIndex = this.proIndex;
      dataOut.proList = this.proList;
      dataOut.started = this.started;
      dataOut.speakTime = this.speakTime;
      dataOut.user = userService.socketIdToUser[socketId];
      dataOut.msg = new Msg("system", "游戏开始");
      myEmitter.emit("Send_Sth", dataOut);
      this.selectPre(this.playerList[Math.floor(Math.random() * this.playerList.length)]);
    }
  }


  /**
   * 玩家分配身份
   * 每一名玩家独立发送 身份消息
   */
  setPlayer() {
    console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");
    let tmp;
    this.playerList.filter(t => { t.seatNo = Math.random(); });
    this.playerList.sort((a, b) => { return a.seatNo - b.seatNo; });
    this.hitler = this.playerList[0];
    this.hitler.role = "Hitler";
    let hitData = new Data("role", this.hitler);
    hitData.role = "Hitler";
    if (this.playerList.length <= 6) {
      hitData.other = this.fascist;
    }
    for (let i = 1; i <= this.fascistCount; i++) {
      this.fascist.push(this.playerList[i]);
      this.playerList[i].role = "Fascist";
    }
    for (let i = 1; i <= this.fascistCount; i++) {
      tmp = new Data("role", this.playerList[i]);
      tmp.role = "Fascist";
      tmp.other = this.fascist;
      tmp.target = this.hitler;
      myEmitter.emit("Send_Sth", tmp);
    }
    myEmitter.emit("Send_Sth", hitData);
    for (let i = this.fascistCount + 1; i < this.playerList.length; i++) {
      this.liberal.push(this.playerList[i]);
      this.playerList[i].role = "Liberal";
      tmp = new Data("role", this.playerList[i]);
      tmp.role = "Liberal";
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

  /**
   * 选择游戏板
   * 无通知
   */
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


  /**
   * 洗牌
   * 无通知
   */
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

    let data = new Data("shuffle");
    data.msg = new Msg("system", "法案牌堆和弃牌堆重新洗混了");
    myEmitter.emit("Send_Sth", data);

  }


  /**
   * 选总统，一轮结束后继续游戏的象征
   * 通知玩家
   */
  selectPre(player: User, next?: boolean) {
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
    } else { }
    console.log("本届总统是", this.pre.name);
    // console.log("下届总统是", this.prenext.name);
    // 处理是否可选问题
    let playerSurvival = this.playerList.filter(t => {
      return t.isSurvival;
    }).length;
    // console.log("当前存活人数", playerSurvival);
    if (playerSurvival > 5) {
      // console.log("人数大于5");
      this.playerList.filter(t => {
        if (t.isLastPrm || t.isLastPre) {
          t.canBeSelect = false;
        } else {
          t.canBeSelect = true;
        }
      });
    } else {
      // console.log("人数小于等于5");
      this.playerList.filter(t => {
        if (t.isLastPrm) {
          t.canBeSelect = false;
        } else {
          t.canBeSelect = true;
        }
      });
    }
    let data = new Data("selectPrm");
    data.playerList = this.playerList;
    data.pre = this.pre;
    data.msg = new Msg("choosePlayer", "等待总统 " + this.pre.name + " 选总理..", "selectPrm", true);
    myEmitter.emit("Send_Sth", data);
  }

  // 设定总理
  setPrm(user: User) {
    // 待投票总理
    this.prmTmp = userService.socketIdToUser[user.socketId];
    this.prmTmp.isPrm = true;
    console.log(Date().toString().slice(15, 25), "创建新投票");
    this.setVote();
    let data0 = new Data("updata");
    data0.msg = new Msg("choosePlayer", "总统选择了 " + this.prmTmp.name, "selectPrm", false, this.prmTmp);
    myEmitter.emit("Send_Sth", data0);
    let data = new Data("pleaseVote");
    data.playerList = this.playerList;
    data.prmTmp = this.prmTmp;
    data.pre = this.pre;
    data.voteCount = this.voteCount;
    data.nowVote = this.nowVote;
    data.msg = new Msg("player_vote", "总统 " + this.pre.name + "  总理 " + this.prmTmp.name + " 请投票..", "player_vote", true);
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

    let data = new Data("pleaseVote");
    this.nowVote[userService.socketIdToUser[sockeId].seatNo - 1] = res;
    this.voteCount = this.voteCount + 1;
    data.nowVote = this.nowVote;
    data.msg = new Msg("my_vote", userService.socketIdToUser[sockeId].name + "投票了");
    myEmitter.emit("Send_Sth", data);
    if (this.voteCount === this.nowVote.length) {
      // 投票完成
      if (this.nowVote.filter(t => {
        return t === 2;
      }).length * 2 > this.nowVote.length - this.nowVote.filter(t => {
        return t === 4;
      }).length) {
        // 成功data
        if (this.prm) {
          this.prm.isPrm = false;
        }
        this.prm = this.prmTmp;
        this.prm.isPrm = true;
        data.prm = this.prm;
        data.playerList = this.playerList;
        if (this.proEffRed >= 3 && this.prmTmp.role === "Hitler") {
          //  总理生效 判断希特勒上位
          console.log("游戏结束");
          this.gameover("游戏结束，红色胜利");
          data.msg = new Msg("system", "同意票超过半数，政府成立,希特勒在危机时刻上任总理，游戏结束，红色胜利");
          myEmitter.emit("Send_Sth", data);
          // todo
        } else {
          data.msg = new Msg("system", "同意票超过半数，政府成立,等待总统 " + this.pre.name + " 选提案");
          data.voteRes = 1;
          myEmitter.emit("Send_Sth", data);
          this.findPro();
        }
      } else {
        // 失败

        this.prmTmp.isPrm = false;
        data.voteRes = 0;
        this.failTimes = this.failTimes + 1;
        if (this.failTimes === 3) {
          // 强制生效
          data.msg = new Msg("system", "同意票未超过半数，政府组建失败，连续三次组建政府失败，法案强制生效一张");
          myEmitter.emit("Send_Sth", data);
          this.proEff(this.proList[this.proIndex], true);
        } else {
          data.msg = new Msg("system", "同意票未超过半数，政府组建失败，切换下任总统候选");
          myEmitter.emit("Send_Sth", data);
          // say 不发言直接下一届政府
          this.selectPre(this.prenext);
        }
      }
    } else {
      console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
    }

  }






  veto_all() {
    // todo 通知玩家
    let data = new Data("veto_all");
    data.msg = new Msg("playerCP", "总统同意了总理全部否决的提议，本届政府失效", "prm_CP", "veto_all", "veto_all");
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
  findPro(list?: Array<any>, proDiscard?: number) {

    if (!list) {
      let proTmp = [];
      if (this.proIndex < 2) {
        this.shuffle();
      }
      for (let n = this.proIndex; n >= this.proIndex - 2; n--) {
        proTmp.push(this.proList[n]);
      };
      this.proIndex = this.proIndex - 3; // 摸三张后牌堆顶变换
      this.proX3List = [];
      this.proX3List[0] = proTmp;
      this.proX3ListHide[0] = ["x", "x", "x"];
      // -----pre_CP----
      let data = new Data("choosePro");
      data.msg = new Msg("playerCP", this.proX3ListHide, "pre_CP", this.proX3List);
      data.proIndex = this.proIndex;
      myEmitter.emit("Send_Sth", data);
    } else {
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
          let data = new Data("choosePro");
          data.msg = new Msg("playerCP", this.proX3ListHide, "prm_CP", this.proX3List);
          myEmitter.emit("Send_Sth", data);
        } else {
          let data = new Data("choosePro");
          data.msg = new Msg("playerCP", this.proX3ListHide, "prm_CP", this.proX3List, "prm_CP_veto_all");
          myEmitter.emit("Send_Sth", data);
          // ------有否决权
          // todo
        }




      } else {
        //  ------CP_end--------生效过程
        list[1].splice(list[1].indexOf(proDiscard), 1); // 从待选牌堆删除该法案
        this.proX3List[2] = list[1];
        this.proX3List[1] = [proDiscard];
        this.proX3ListHide[1] = ["x"];
        this.proX3ListHide[2] = ["x"];
        let data = new Data("choosePro");
        data.msg = new Msg("playerCP", this.proX3ListHide, "end_CP", this.proX3List);
        myEmitter.emit("Send_Sth", data);
        this.proEff(this.proX3List[2][0]); // 法案生效
        this.proX3List = [];
        this.proX3ListHide = [];
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
    let data = new Data("proEff");
    this.failTimes = 0;
    this.pro = pro;
    console.log(pro);
    if (pro >= 6) {
      console.log("红色提案生效");
      // data.msg = new Msg("system", "红色提案生效");
      this.proEffRed = this.proEffRed + 1;
    } else {
      console.log("蓝色提案生效");
      // data.msg = new Msg("system", "蓝色提案生效");
      this.proEffBlue = this.proEffBlue + 1;
    }
    data.pro = this.pro;
    data.proEffRed = this.proEffRed;
    data.proEffBlue = this.proEffBlue;
    myEmitter.emit("Send_Sth", data);

    let data2 = new Data("proEff");
    if (this.proEffRed === 6) {
      this.started = false;
      console.log("红方胜利");
      //   todo:结算
      console.log("游戏结束");

      data2.msg = new Msg("system", "6张红色法案生效，法西斯阵营胜利");
      myEmitter.emit("Send_Sth", data2);

      this.gameover("游戏结束，红色胜利");
    } else {
      if (this.proEffBlue === 5) {
        this.started = false;
        console.log("蓝方胜利");
        //   todo:结算
        console.log("游戏结束");
        this.gameover("游戏结束，蓝色胜利");
        data2.msg = new Msg("system", "5张蓝色法案生效，自由党阵营胜利");
        myEmitter.emit("Send_Sth", data2);

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
        data.proIndex = this.proIndex;
        data.proList = this.proList;
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
          let msgDataToAll = new Data("speak_endAll");
          msgDataToAll.msg = new Msg("system", "玩家顺序发言结束");
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
      let data = new Data("invPlayer");
      data.msg = new Msg("system", "等待总统调查身份");
      myEmitter.emit("Send_Sth", data);

    } else {
      console.log("告知调查结果");
      let data2 = new Data("invPlayer", this.pre);
      if (this.liberal.filter(t => {
        return t.socketId === player.socketId;
      })[0]) {
        data2.other = "./pic/结果蓝.png";
      } else {
        data2.other = "./pic/结果红.png";
      }
      data2.target = player;
      myEmitter.emit("Send_Sth", data2);
      let data3 = new Data("通知");
      data3.msg = new Msg("system", "总统成功调查了 " + player.name + " 的身份");
      myEmitter.emit("Send_Sth", data3);
      // todo 玩家确认过程
      setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
    }


  }
  // 技能：指定总统
  async    preSelect() {
    console.log("指定总统");
    let tmp = new Array<Data>();
    let data = new Data("preSelect");
    data.msg = new Msg("choosePlayer", "等待总统 " + this.pre.name + " 执行权利：指定下任总统..", "preSelect");
    myEmitter.emit("Send_Sth", data);

    setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
  }
  // 技能：枪决
  toKill(player?: User) {
    console.log("枪决");

    // 杀人动作
    if (typeof player === "undefined") {
      // 通知杀人列表
      let data = new Data("toKill");
      data.msg = new Msg("choosePlayer", "等待总统 " + this.pre.name + " 执行权利：决定枪决的目标", "toKill");
      myEmitter.emit("Send_Sth", data);

    } else {
      // 结算杀人选择
      // 从玩家状态修改
      player = userService.socketIdToUser[player.socketId];
      player.isSurvival = false;
      let data = new Data("toKill");
      data.target = player;
      data.playerList = this.playerList;
      data.msg = new Msg("system", "总统枪决了 " + player.name);
      myEmitter.emit("Send_Sth", data);
      player = userService.socketIdToUser[player.socketId];
      if (player.role === "Hitler") {
        console.log("游戏结束");
        data.msg = new Msg("system", "总统枪决的人是希特勒 游戏结束，自由党胜利");
        this.gameover("游戏结束，蓝色胜利");
        // todo
      } else {
        // 枪毙的是下届总统时，切换下届总统
        if (this.prenext.socketId === player.socketId) {
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
    if (this.proIndex < 2) {
      console.log("牌堆数量不足");
      this.shuffle();
    }
    let data = new Data("toLookPro", this.pre);
    data.proX3List = new Array<number>();
    for (let i = 0; i <= 2; i++) {
      data.proX3List.push(this.proList[this.proIndex - i]);
    }
    data.msg = new Msg("hgnlookpro", data.proX3List, "isyou");
    myEmitter.emit("Send_Sth", data);

    let data2 = new Data("通知");
    data2.toWho = this.playerList.filter(t => {
      return !t.isPre;
    });
    data2.msg = new Msg("hgnlookpro", ["x", "x", "x"], "notyou");
    myEmitter.emit("Send_Sth", data2);


    // todo 玩家查看法案时的确认过程
    setTimeout(() => { myEmitter.emit("skill_is_done"); }, 2000);
  }


  // gameOver
  gameover(res) {
    let tmp = new Array<Data>();
    let data = new Data("gameover");
    data.other = res;
    myEmitter.emit("Send_Sth", data);

  }


  /**
   * 游戏初始化
   * 无通知
   */
  gameInit() {
    //  ------------ 数据初始化start
    this.started = true;
    this.skillList = new Array<Function>();
    this.proList = new Array<any>();  // 法案牌堆
    for (let i = 0; i <= 16; i++) {
      this.proList.push(i);
    }
    this.proIndex = 16; // 牌堆顶
    this.voteList = new Array<Array<number>>(); // 投票总记录
    this.fascist = new Array<User>();
    this.liberal = new Array<User>();
    this.voteRes = 0;
    this.proEffBlue = 0; // 法案生效数
    this.proEffRed = 0; // 法案生效数
    this.failTimes = 0; // 政府组件失败次数
    this.isVoted = false;
    this.proX3ListHide = [];
    this.proX3List = [];
    //  ------------ 数据初始化end

    this.shuffle();
    this.selectGame();
  }


  constructor() { }
}
