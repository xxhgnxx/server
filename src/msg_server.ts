import { User } from "./user";
import { Msg } from "./hgnmsg";
import { hList } from "./server";
import { myEmitter } from "./myEmitter";


export class MsgServices {

  allPlayerMsgList: Array<Array<Msg>> = [];
  noToUser = [];

  pushAll(msg: Msg, user1?: User, user2?: User, user3?: User) {
    for (let i = 0; i < this.allPlayerMsgList.length; i++) {
      if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
        this.allPlayerMsgList[i].push(JSON.parse(JSON.stringify(msg)));
        if (i) {
          myEmitter.emit("Push_msg", this.noToUser[i], msg);
        }
      }
    }
    for (let i = 0; i < hList.userList.length; i++) {
      if (hList.userList[i].seatNo === 0) {
        myEmitter.emit("Push_msg", hList.userList[i], msg);
      }
    }
  }

  changestepAll(n, user1?: User, user2?: User, user3?: User) {
    for (let i = 0; i < this.allPlayerMsgList.length; i++) {
      if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
        let msg = this.allPlayerMsgList[i][this.allPlayerMsgList[i].length - 1];
        msg.step = n;
        if (i) {
          myEmitter.emit("Updata_msg", this.noToUser[i], msg);
        }
      }
    }
    let msg = this.allPlayerMsgList[0][this.allPlayerMsgList[0].length - 1];
    for (let i = 0; i < hList.userList.length; i++) {
      if (hList.userList[i].seatNo === 0) {
        myEmitter.emit("Updata_msg", hList.userList[i], msg);
      }
    }
  }
  updataAll(msg: Msg, user1?: User, user2?: User, user3?: User) {
    for (let i = 0; i < this.allPlayerMsgList.length; i++) {
      if ((this.noToUser[i].name !== (user1 && user1.name)) && (this.noToUser[i].name !== (user3 && user3.name)) && (this.noToUser[i].name !== (user2 && user2.name))) {
        this.allPlayerMsgList[i].pop();
        this.allPlayerMsgList[i].push(JSON.parse(JSON.stringify(msg)));
        if (i) {
          myEmitter.emit("Updata_msg", this.noToUser[i], msg);
        }
      }
    }
    for (let i = 0; i < hList.userList.length; i++) {
      if (hList.userList[i].seatNo === 0) {
        myEmitter.emit("Updata_msg", hList.userList[i], msg);
      }
    }
  }

  pushWho(who: User, msg: Msg) {
    this.allPlayerMsgList[who.seatNo].push(JSON.parse(JSON.stringify(msg)));
    myEmitter.emit("Push_msg", who, msg);
  }


  updataWho(who: User, msg: Msg) {
    this.allPlayerMsgList[who.seatNo].pop();
    this.allPlayerMsgList[who.seatNo].push(JSON.parse(JSON.stringify(msg)));
    myEmitter.emit("Updata_msg", who, msg);
  }

  updataspk(n, msg?: string) {
    for (let i = 0; i < this.allPlayerMsgList.length; i++) {
      let thismsg = this.allPlayerMsgList[i][this.allPlayerMsgList[i].length - 1];
      thismsg.step = n;
      if (msg) {
        thismsg.msgList.push(msg);
      }
      if (i) {
        myEmitter.emit("Updata_msg", this.noToUser[i], thismsg);
        console.log(this.noToUser[i],thismsg);
      }
    }
    for (let i = 0; i < hList.userList.length; i++) {

      if (hList.userList[i].seatNo === 0) {
        myEmitter.emit("Updata_msg", hList.userList[i], this.allPlayerMsgList[0][this.allPlayerMsgList[0].length - 1]);
      }
    }
  }

  changestepWho(who: User, n) {
    let msg = this.allPlayerMsgList[who.seatNo][this.allPlayerMsgList[who.seatNo].length - 1];
    msg.step = n;
    myEmitter.emit("Updata_msg", who, msg);

  }


  showWho(who: User) {
    let msgList = this.allPlayerMsgList[who.seatNo];
    myEmitter.emit("show_msg", who, msgList);
  }
  showAll() { }







  //
  // msgListAll = new Array<any>(); // 总发言记录
  // msgListNow = new Array<any>(); // 当前发言记录
  // newPlayerSpeak(player: User) {
  //   let tmp = new Array<any>();
  //   tmp.push(player);
  //   this.msgListAll.push(tmp);
  //   this.msgListNow = tmp;
  // }

  constructor() {
    this.allPlayerMsgList = [];
    this.allPlayerMsgList.push(new Array<Msg>());
    this.noToUser = [];
    this.noToUser.push(new User("x"));

    for (let i = 0; i < hList.playerList.length; i++) {
      this.allPlayerMsgList.push(new Array<Msg>());
      this.noToUser.push(hList.playerList[i]);
    }
  }

}
