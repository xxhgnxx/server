import { userService } from "./server";
import { hList } from "./server";
import { User } from "./user";
import { Data } from "./data";
import { Msg } from "./hgnmsg";
import { MsgServices } from "./msg_server";
import { myEmitter } from "./myEmitter";


export class Game {
  // skillList = new Array<Function | string>();  // 技能列表
  skillList: Array<Function>;  // 技能列表
  skillnamelist = new Array<number>();
  proList: Array<any>;  // 法案牌堆
  proIndex: number; // 牌堆顶
  proX3List = new Array<any>(); // 法案牌摸的三张牌
  proX3ListHide = new Array<any>(); // 法案牌摸的三张牌平民模板
  started: boolean = false;       // 游戏是否开始
  gametype: number;
  // playerList: Array<User>; // 加入本次游戏的玩家列表，主要用于消息发送
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
  tmppre: any;  // 发动指定总统，需要的临时存储区
  prenext: User;
  prm: User;
  prmTmp: User;  // 待投票的总理

  hitler: User;
  fascist: Array<User>;
  liberal: Array<User>;

  // 游戏发言
  msgListAll = new Array<any>(); // 总发言记录
  msgListNow = new Array<any>(); // 当前发言记录
  speakTime: number = 2000;  // 发言时间 设定 单位 秒


  lastTurn = new Map(); // 上一次政府情况


  msgServices: MsgServices;

  welcomeback(who: User) {
    if (!this.started) {
      console.log("游戏未开始，无资料更新");
      return;
    }
    let dataOut = new Data("loaddata");
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
    myEmitter.emit("Send_Sth", dataOut);
    this.msgServices.showWho(who);
  }

  start(socketId) {
    hList.playerList = hList.userList.filter(t => {
      return t.isSeat === true;
    });
    if (hList.playerList.length < 5) {
      console.log("人数不足：", hList.playerList.length);
      return false;
    } else {
      console.log("游戏开始", hList.playerList.length);
      this.gameInit();
      this.setPlayer();
      this.msgServices = new MsgServices();
      let dataOut = new Data("gamestart");
      dataOut.hList = hList;
      dataOut.fascistCount = this.fascistCount;
      dataOut.failTimes = this.failTimes;
      dataOut.proIndex = this.proIndex;
      dataOut.proList = this.proList;
      dataOut.started = this.started;
      dataOut.gametype = this.gametype;
      dataOut.speakTime = this.speakTime;
      dataOut.skillnamelist = this.skillnamelist;
      dataOut.user = userService.socketIdToUser[socketId];
      myEmitter.emit("Send_Sth", dataOut);

      let gamestartmsg = new Msg("gamestart");
      this.msgServices.pushAll(gamestartmsg);


      this.selectPre(hList.playerList[Math.floor(Math.random() * hList.playerList.length)]);
    }
  }


  /**
   * 玩家分配身份
   * 每一名玩家独立发送 身份消息
   */
  setPlayer() {
    console.log("分发玩家身份牌,打乱玩家座位，生成新的顺序");

    hList.playerList.filter(t => { t.seatNo = Math.random(); });
    hList.playerList.sort((a, b) => { return a.seatNo - b.seatNo; });
    this.hitler = hList.playerList[0];
    this.hitler.role = "Hitler";
    for (let i = 1; i <= this.fascistCount; i++) {
      this.fascist.push(hList.playerList[i]);
      hList.playerList[i].role = "Fascist";
      hList.playerList[i].hitler = this.hitler;
    }


    if (hList.playerList.length < 7) {
      for (let i = 1; i <= this.fascistCount; i++) {
        this.hitler["fascist" + i.toString()] = JSON.parse(JSON.stringify(hList.playerList[i]));
      }
    }
    for (let n = 1; n <= this.fascistCount; n++) {
      for (let i = 1; i <= this.fascistCount; i++) {
        hList.playerList[n]["fascist" + i.toString()] = JSON.parse(JSON.stringify(hList.playerList[i]));
      }
    }

    for (let i = this.fascistCount + 1; i < hList.playerList.length; i++) {
      this.liberal.push(hList.playerList[i]);
      hList.playerList[i].role = "Liberal";
    }
    hList.playerList.filter(t => { t.seatNo = Math.random(); });
    hList.playerList.sort((a, b) => { return a.seatNo - b.seatNo; });
    for (let i = 0; i < hList.playerList.length; i++) {
      hList.playerList[i].seatNo = i + 1;
    }
    let data = new Data("updata");
    data.hList = hList;
    myEmitter.emit("Send_Sth", data);
    console.log(hList);
    console.log("-------完成");
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
    let plyaerCount = hList.playerList.length;
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

    } else {
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
      } else {
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
    // data.msg = new Msg("system", "法案牌堆和弃牌堆重新洗混了");
    myEmitter.emit("Send_Sth", data);

  }


  next(player: User) {
    if (hList.playerList[hList.playerList.indexOf(player) + 1]) {
      this.prenext = hList.playerList[hList.playerList.indexOf(player) + 1];
    } else {
      this.prenext = hList.playerList[0];
    };
  }


  /**
   * 选总统，一轮结束后继续游戏的象征
   * 通知玩家
   */
  selectPre(player: User) {
    if (this.prm) {
      this.prm.isPrm = false;
    }
    hList.playerList.filter(t => { t.isPre = false; });
    if (this.pre) {
      this.pre.isPre = false;
    }
    this.pre = userService.socketIdToUser[player.socketId];
    this.pre.isPre = true;
    if (this.tmppre) {
      // 技能导致非顺序指定
      console.log("技能导致总统顺序变化");
      this.prenext = this.tmppre;
      this.tmppre = false;
    } else {
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
    let playerSurvival = hList.playerList.filter(t => {
      return t.isSurvival;
    }).length;
    // console.log("当前存活人数", playerSurvival);
    if (playerSurvival > 5) {
      // console.log("人数大于5");
      hList.playerList.filter(t => {
        if (t.isLastPrm || t.isLastPre) {
          t.canBeSelect = false;
        } else {
          t.canBeSelect = true;
        }
      });
    } else {
      // console.log("人数小于等于5");
      hList.playerList.filter(t => {
        if (t.isLastPrm) {
          t.canBeSelect = false;
        } else {
          t.canBeSelect = true;
        }
      });
    }
    this.pre.canBeSelect = false;
    let data = new Data("selectPrm");
    data.hList = hList;
    data.pre = this.pre;
    myEmitter.emit("Send_Sth", data);

    let msg = new Msg("selectPrm");
    msg.msg = "等待总统选择总理";
    msg.step = 0;
    msg.pre = this.pre;
    msg.userList = hList.playerList;
    this.msgServices.pushAll(msg, this.pre);
    msg.step = 1;
    this.msgServices.pushWho(this.pre, msg);

  }

  // 设定总理
  setPrm(user: User) {
    // 待投票总理
    this.prmTmp = userService.socketIdToUser[user.socketId];
    this.prmTmp.isPrm = true;
    console.log(Date().toString().slice(15, 25), "创建新投票");
    this.setVote();
    let data0 = new Data("updata");
    myEmitter.emit("Send_Sth", data0);



    let data = new Data("pleaseVote");
    data.hList = hList;
    myEmitter.emit("Send_Sth", data);

    let msgvotestart = new Msg("vote_please");
    msgvotestart.pre = this.pre;
    msgvotestart.prm = this.prmTmp;
    msgvotestart.userList = hList.playerList;
    msgvotestart.voteCount = this.voteCount;
    msgvotestart.nowVote = this.nowVote;
    this.msgServices.updataAll(msgvotestart);

  }



  // 发起投票
  setVote() {
    let tmp = new Array<number>();
    this.voteCount = 0;
    for (let i = 0; i < hList.playerList.length; i++) {
      if (hList.playerList[i].isSurvival) {
        tmp[hList.playerList[i].seatNo - 1] = 0;
      } else {
        tmp[hList.playerList[i].seatNo - 1] = 4;
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


    this.nowVote[userService.socketIdToUser[sockeId].seatNo - 1] = res;
    this.voteCount = this.voteCount + 1;
    console.log("投票记录", this.voteCount + "/" + this.nowVote.length);
    // data.nowVote = this.nowVote;
    // myEmitter.emit("Send_Sth", data);
    let msgvote = new Msg("vote_please");
    msgvote.pre = this.pre;
    msgvote.prm = this.prmTmp;
    msgvote.userList = hList.playerList;
    msgvote.voteCount = this.voteCount;
    msgvote.nowVote = this.nowVote;
    this.msgServices.updataAll(msgvote);
    if (this.voteCount === this.nowVote.length) {
      // 投票完成
      let data = new Data("updata");
      if (this.nowVote.filter(t => {
        return t === 2;
      }).length * 2 > this.nowVote.length - this.nowVote.filter(t => {
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
        data.hList = hList;
        if (this.proEffRed >= 3 && this.prmTmp.role === "Hitler") {
          //  总理生效 判断希特勒上位
          console.log("游戏结束");
          setTimeout(() => this.gameover("游戏结束，红色胜利"), 2000);
          // todo
          myEmitter.emit("Send_Sth", data);
          // todo
        } else {
          myEmitter.emit("Send_Sth", data);
          setTimeout(() => this.findPro(), 2000);

        }
      } else {
        // 失败
        msgvote.voteRes = 2;
        this.msgServices.updataAll(msgvote);

        this.prmTmp.isPrm = false;
        data.voteRes = 0;
        this.failTimes = this.failTimes + 1;
        data.failTimes = this.failTimes;
        if (this.failTimes === 3) {
          // 强制生效
          myEmitter.emit("Send_Sth", data);
          setTimeout(() => this.proEff(this.proList[this.proIndex], true), 2000);

        } else {
          myEmitter.emit("Send_Sth", data);
          // say 不发言直接下一届政府
          setTimeout(() => this.selectPre(this.prenext), 2000);
        }
      }
    } else {
    }

  }






  veto_all() {
    // todo 通知玩家
    this.changestepWho(40);

    let data = new Data("veto_all");

    this.failTimes = this.failTimes + 1;
    data.failTimes = this.failTimes;
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


  speakstart(who: User) {
    let spk = new Msg("playerSpk");
    spk.who = Object.assign({}, who);
    spk.step = 1;
    spk.msgList = [];
    this.msgServices.pushAll(spk);
  }

  speaksth(msg) {
    this.msgServices.updataspk(1, msg);
  }
  speakend() {
    this.msgServices.updataspk(0);
  }


  //  法案牌过程
  findPro(list?: Array<any>, proDiscard?: number) {

    if (!list) {
      let proTmp = [];
      if (this.proIndex < 2) {
        this.shuffle();
        // todo 洗牌通知
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
      data.proIndex = this.proIndex;
      myEmitter.emit("Send_Sth", data);
      let chooseProMsg1 = new Msg("choosePro");
      chooseProMsg1.pre = this.pre;
      chooseProMsg1.prm = this.prm;
      chooseProMsg1.step = 1;
      chooseProMsg1.proX3List = [];
      chooseProMsg1.proX3List[0] = ["x", "x", "x"];
      this.msgServices.pushAll(chooseProMsg1);
      chooseProMsg1 = new Msg("choosePro");
      chooseProMsg1.pre = this.pre;
      chooseProMsg1.prm = this.prm;
      chooseProMsg1.step = 1;
      chooseProMsg1.proX3List = [];
      chooseProMsg1.proX3List[0] = proTmp;
      this.msgServices.updataWho(this.pre, chooseProMsg1);
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
          myEmitter.emit("Send_Sth", data);


          let chooseProMsg2 = new Msg("choosePro");
          chooseProMsg2.pre = this.pre;
          chooseProMsg2.prm = this.prm;
          chooseProMsg2.step = 2;
          chooseProMsg2.proX3List = [];
          chooseProMsg2.proX3List[0] = ["x"];
          chooseProMsg2.proX3List[1] = ["x", "x"];
          for (let i = 0; i < hList.playerList.length; i++) {
            if (!hList.playerList[i].isPre && !hList.playerList[i].isPrm) {
              this.msgServices.updataWho(hList.playerList[i], chooseProMsg2);
            }
          }
          chooseProMsg2 = new Msg("choosePro");
          chooseProMsg2.pre = this.pre;
          chooseProMsg2.prm = this.prm;
          chooseProMsg2.step = 2;
          chooseProMsg2.proX3List = [];
          chooseProMsg2.proX3List[0] = ["x"];
          chooseProMsg2.proX3List[1] = list[0];
          this.msgServices.updataWho(this.prm, chooseProMsg2);
          chooseProMsg2 = new Msg("choosePro");
          chooseProMsg2.pre = this.pre;
          chooseProMsg2.prm = this.prm;
          chooseProMsg2.step = 2;
          chooseProMsg2.proX3List = [];
          chooseProMsg2.proX3List[1] = list[0];
          chooseProMsg2.proX3List[0] = [proDiscard];
          this.msgServices.updataWho(this.pre, chooseProMsg2);
        } else {
          // ------有否决权

          let chooseProMsg2 = new Msg("choosePro");
          chooseProMsg2.pre = this.pre;
          chooseProMsg2.prm = this.prm;
          chooseProMsg2.step = 3;
          chooseProMsg2.proX3List = [];
          chooseProMsg2.proX3List[0] = ["x"];
          chooseProMsg2.proX3List[1] = ["x", "x"];
          for (let i = 0; i < hList.playerList.length; i++) {
            if (!hList.playerList[i].isPre && !hList.playerList[i].isPrm) {
              this.msgServices.updataWho(hList.playerList[i], chooseProMsg2);
            }
          }
          chooseProMsg2 = new Msg("choosePro");
          chooseProMsg2.pre = this.pre;
          chooseProMsg2.prm = this.prm;
          chooseProMsg2.proX3List = [];
          chooseProMsg2.proX3List[0] = ["x"];
          chooseProMsg2.step = 31;
          chooseProMsg2.proX3List[1] = list[0];
          this.msgServices.updataWho(this.prm, chooseProMsg2);
          chooseProMsg2 = new Msg("choosePro");
          chooseProMsg2.pre = this.pre;
          chooseProMsg2.prm = this.prm;
          chooseProMsg2.step = 3;
          chooseProMsg2.proX3List = [];
          chooseProMsg2.proX3List[1] = list[0];
          chooseProMsg2.proX3List[0] = [proDiscard];
          this.msgServices.updataWho(this.pre, chooseProMsg2);
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
        myEmitter.emit("Send_Sth", data);

        let chooseProMsg3 = new Msg("choosePro");
        chooseProMsg3.pre = this.pre;
        chooseProMsg3.prm = this.prm;
        chooseProMsg3.step = 0;
        chooseProMsg3.proX3List = [];
        chooseProMsg3.proX3List[0] = ["x"];
        chooseProMsg3.proX3List[1] = ["x"];
        chooseProMsg3.proX3List[2] = list[1];
        for (let i = 0; i < hList.playerList.length; i++) {
          if (!hList.playerList[i].isPre && !hList.playerList[i].isPrm) {
            this.msgServices.updataWho(hList.playerList[i], chooseProMsg3);
          }
        }
        chooseProMsg3 = new Msg("choosePro");
        chooseProMsg3.pre = this.pre;
        chooseProMsg3.prm = this.prm;
        chooseProMsg3.step = 0;
        chooseProMsg3.proX3List = [];
        chooseProMsg3.proX3List[0] = ["x"];
        chooseProMsg3.proX3List[2] = list[1];
        chooseProMsg3.proX3List[1] = [proDiscard];
        this.msgServices.updataWho(this.prm, chooseProMsg3);
        chooseProMsg3 = new Msg("choosePro");
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
      this.proEffRed = this.proEffRed + 1;
    } else {
      console.log("蓝色提案生效");
      this.proEffBlue = this.proEffBlue + 1;
    }
    data.failTimes = 0;
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

      myEmitter.emit("Send_Sth", data2);

      this.gameover("游戏结束，红色胜利");
    } else {
      if (this.proEffBlue === 5) {
        this.started = false;
        console.log("蓝方胜利");
        //   todo:结算
        console.log("游戏结束");
        this.gameover("游戏结束，蓝色胜利");
        myEmitter.emit("Send_Sth", data2);

      } else {
        this.proList.splice(this.proList.indexOf(pro), 1); // 从总牌堆删除生效法案
        for (let n in hList.playerList) {
          hList.playerList[n].isLastPre = false;
          hList.playerList[n].isLastPrm = false;

        } // 上届政府标记归零
        if (!force) {
          // 普通生效，变更政府标记
          this.pre.isLastPre = true;
          this.prm.isLastPrm = true;

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
            myEmitter.emit("Send_Sth", msgDataToAll);
            this.selectPre(this.prenext); // 切换总统 继续游戏
          });

        } else {
          // 强制生效时，牌堆顶摸走一张
          hList.playerList.filter((t) => {
            t.isLastPre = false;
            t.isLastPrm = false;
          });
          this.proIndex = this.proIndex - 1;
          data.proIndex = this.proIndex;
          data.proList = this.proList;
          myEmitter.emit("Send_Sth", data);
          myEmitter.emit("speak_start");
          myEmitter.once("speak_endAll", () => {
            let msgDataToAll = new Data("speak_endAll");
            myEmitter.emit("Send_Sth", msgDataToAll);
            this.selectPre(this.prenext); // 切换总统 继续游戏
          });



        }



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
      myEmitter.emit("Send_Sth", data);

      let invPlayerMsg = new Msg("invPlayer");
      invPlayerMsg.step = 2;
      invPlayerMsg.userList = hList.playerList;
      invPlayerMsg.who = this.pre;
      this.msgServices.pushAll(invPlayerMsg, this.pre);
      invPlayerMsg.step = 1;
      this.msgServices.pushWho(this.pre, invPlayerMsg);
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
      myEmitter.emit("Send_Sth", data3);

      let invPlayerMsg = new Msg("invPlayer");
      invPlayerMsg.who = this.pre;
      invPlayerMsg.step = 4;
      invPlayerMsg.target = player;
      this.msgServices.updataAll(invPlayerMsg, this.pre);
      invPlayerMsg.step = 3;
      invPlayerMsg.role = data2.other;
      this.msgServices.updataWho(this.pre, invPlayerMsg);
      // todo 玩家确认过程
      setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
    }


  }
  // 技能：指定总统
  preSelect() {
    console.log("指定总统");
    let tmp = new Array<Data>();
    let data = new Data("preSelect");
    let preSelect_msg = new Msg("preSelect");
    preSelect_msg.step = 2;
    preSelect_msg.who = this.pre;
    preSelect_msg.userList = hList.playerList;
    this.msgServices.pushAll(preSelect_msg, this.pre);
    preSelect_msg.userList = hList.playerList;
    preSelect_msg.step = 1;
    this.msgServices.pushWho(this.pre, preSelect_msg);
    myEmitter.emit("Send_Sth", data);
  }
  setPre(player) {
    let invPlayerMsg = new Msg("preSelect");
    invPlayerMsg.who = this.pre;
    invPlayerMsg.step = 3;
    invPlayerMsg.target = player;
    this.msgServices.updataAll(invPlayerMsg);
    this.tmppre = this.prenext;
    player = hList.playerList.filter(t => {
      return t.name === player.name;
    })[0];
    this.prenext = player;
    setTimeout(() => { myEmitter.emit("skill_is_done"); }, 0);
  }



  // 技能：枪决
  toKill(player?: User) {
    console.log("枪决");

    // 杀人动作
    if (typeof player === "undefined") {
      // 通知杀人列表
      let data = new Data("toKill");
      myEmitter.emit("Send_Sth", data);
      let toKill = new Msg("toKill");
      toKill.step = 2;
      toKill.who = this.pre;
      toKill.userList = hList.playerList;
      this.msgServices.pushAll(toKill, this.pre);
      toKill.step = 1;
      this.msgServices.pushWho(this.pre, toKill);
    } else {
      // 结算杀人选择
      // 从玩家状态修改
      player = userService.socketIdToUser[player.socketId];
      player.isSurvival = false;
      let data = new Data("toKill");
      data.target = player;
      data.hList = hList;
      myEmitter.emit("Send_Sth", data);
      let toKill = new Msg("toKill");
      toKill.who = this.pre;
      toKill.step = 3;
      toKill.target = player;
      this.msgServices.updataAll(toKill);
      player = userService.socketIdToUser[player.socketId];
      if (player.role === "Hitler") {
        console.log("游戏结束");
        this.gameover("游戏结束，蓝色胜利");
        // todo
      } else {
        // 枪毙的是下届总统时，切换下届总统
        if (this.prenext.socketId === player.socketId) {
          console.log("被枪决的玩家是下届总统");
          if (hList.playerList[hList.playerList.indexOf(player) + 1]) {
            console.log("被枪决的玩家不是队列末位");
            this.prenext = hList.playerList[hList.playerList.indexOf(player) + 1];
          } else {
            console.log("被枪决的玩家是队列末位");
            this.prenext = hList.playerList[0];
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
    myEmitter.emit("Send_Sth", data);

    let data2 = new Data("通知");
    data2.toWho = hList.playerList.filter(t => {
      return !t.isPre;
    });
    let hgnlookpro_msg = new Msg("hgnlookpro");
    hgnlookpro_msg.step = 1;
    hgnlookpro_msg.proX3List = data.proX3List;
    hgnlookpro_msg.who = this.pre;
    this.msgServices.pushWho(this.pre, hgnlookpro_msg);
    hgnlookpro_msg.proX3List = ["x", "x", "x"];
    hgnlookpro_msg.step = 0;
    this.msgServices.pushAll(hgnlookpro_msg, this.pre);
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
    let gameovermsg = new Msg("gameover");
    gameovermsg.msg = res;
    gameovermsg.userList = hList.playerList;
    this.msgServices.pushAll(gameovermsg);



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
    hList.userList.filter((t) => {
      t.isPre = false;
      t.isPrm = false;
      t.isLastPre = false;
      t.isLastPrm = false;
      t.canBeSelect = false;
    });
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
    this.skillnamelist = new Array<number>();
    //  ------------ 数据初始化end

    this.shuffle();
    this.selectGame();
  }

  changestepWho(n) {
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
  }



  constructor() { hList.playerList = hList.playerList; }
}
