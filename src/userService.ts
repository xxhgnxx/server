import { User }  from "./user";
import { game } from "./server";
import { Data } from "./data";
import { hList } from "./server";

import { Userlisthgn } from "./userList";
import { myEmitter } from "./myEmitter";

export class UserService {
  socketIdToUser = new Map<string, User>();
  NameToPass = new Map<string, string>();
  idToUsername = new Map<string, string>();
  usernameToId = new Map<string, string>();
  constructor() {

  }

  login(socket, data: Data) {
    let me = hList.userList.filter(t => { return t.name === data.name; })[0];
    if (me) {
      console.log("用户已存在");
      if (me.isOnline) {
        let tmpuser = new User(data.name);
        tmpuser.socketId = socket.id;
        let dataout = new Data("Login_fail", tmpuser);
        dataout.login = false;
        dataout.toWho = tmpuser;
        dataout.other = "该用户在线";
        myEmitter.emit("Send_Sth", dataout);
        return;
      }
      if (data.pass === this.NameToPass[data.name]) {
        console.log("密码正确");
        console.log(Date().toString().slice(15, 25), "返回", data.name);
        this.idToUsername.delete(this.usernameToId[me.name]);
        let id = this.idgen();
        this.idToUsername[id] = me.name;
        this.usernameToId[me.name] = id;
        this.socketIdToUser[socket.id] = me;
        me.isOnline = true;
        me.socketId = socket.id;
        let dataout = new Data("loginSuccess", me);
        dataout.id = id;
        dataout.login = true;
        dataout.socketId = socket.id;
        dataout.yourself = me;
        dataout.toWho = me;
        dataout.hList = hList;
        myEmitter.emit("Send_Sth", dataout);
        let dataout2 = new Data("updata");
        dataout2.hList = hList;
        dataout2.playerList = hList.playerList;
        myEmitter.emit("Send_Sth", dataout2);
        this.welcomeback(me);
      } else {
        console.log("密码错误");
        let tmpuser = new User(data.name);
        tmpuser.socketId = socket.id;
        let dataout = new Data("Login_fail", tmpuser);
        dataout.login = false;
        dataout.toWho = tmpuser;
        dataout.other = "密码错误";
        myEmitter.emit("Send_Sth", dataout);
      }
    } else {
      console.log(Date().toString().slice(15, 25), "用户新加入", data.name);
      this.socketIdToUser[socket.id] = new User(data.name);
      this.socketIdToUser[socket.id].socketId = socket.id;
      this.NameToPass[data.name] = data.pass;
      let id = this.idgen();
      this.idToUsername[id] = this.socketIdToUser[socket.id].name;
      this.usernameToId[this.socketIdToUser[socket.id].name] = id;
      hList.userList.push(this.socketIdToUser[socket.id]);
      // let tmp = this.userSeat(socket.id); // 测试用
      let dataout = new Data("loginSuccess", this.socketIdToUser[socket.id]);
      dataout.id = id;
      dataout.login = true;
      dataout.socketId = socket.id;
      dataout.yourself = this.socketIdToUser[socket.id];
      dataout.toWho = this.socketIdToUser[socket.id];
      dataout.hList = hList;
      myEmitter.emit("Send_Sth", dataout);
      // ------test 测试用
      // this.socketIdToUser[socket.id].isSeat = true;
      // hList.playerList.push(this.socketIdToUser[socket.id]);
      // console.log("坐下了" + this.socketIdToUser[socket.id].name);
      // ------test 测试用
      let dataout2 = new Data("updata");
      dataout2.hList = hList;
      myEmitter.emit("Send_Sth", dataout2);
      this.welcomeback(this.socketIdToUser[socket.id]);
    }
  }

  quickLogin(socket, data: Data) {
    // todo  登陆成功后，删除以前的id
    if (this.idToUsername[data.id]) {
      console.log("指纹匹配成功");
      let me = hList.userList.filter(t => { return t.name === this.idToUsername[data.id]; })[0];
      this.socketIdToUser.delete(data.id);
      let id = this.idgen();
      this.idToUsername[id] = me.name;
      this.socketIdToUser[socket.id] = me;
      me.isOnline = true;
      me.socketId = socket.id;
      this.idToUsername.delete(this.usernameToId[me.name]);
      this.usernameToId[me.name] = id;
      let dataout = new Data("quickloginSuccess", me);
      dataout.id = id;
      dataout.login = true;
      dataout.socketId = socket.id;
      dataout.yourself = me;
      dataout.hList = hList;
      myEmitter.emit("Send_Sth", dataout);
      let dataOut = new Data("updata");
      dataOut.hList = hList;
      myEmitter.emit("Send_Sth", dataOut);
      this.welcomeback(me);
    } else {
      console.log("指纹匹配失败");
      let tmpuser = new User(data.name);
      tmpuser.socketId = socket.id;
      let dataout = new Data("quickLogin_fail", tmpuser);
      dataout.login = false;
      myEmitter.emit("Send_Sth", dataout);
    }



  }


  logout(socketId): string {
    if (this.socketIdToUser[socketId]) {
      this.socketIdToUser[socketId].isOnline = false;
      if (!game.started) {
        console.log("游戏没开始，从playerlist中剔除该用户");
        this.socketIdToUser[socketId].isSeat = false;
        let tmpuser = hList.playerList.indexOf(this.socketIdToUser[socketId]);
        if (tmpuser !== -1) {
          hList.playerList.splice(tmpuser, 1);
        }
      }

      // 测试代码---------------
      // this.socketIdToUser[socketId].isSeat = false;
      // hList.playerList.splice(hList.playerList.indexOf(this.socketIdToUser[socketId]), 1);

      // 测试代码---------------

      this.socketIdToUser.delete(socketId);
      console.log(Date().toString().slice(15, 25), this.socketIdToUser[socketId].name, "离线");
      return this.socketIdToUser[socketId].name + "离线";
    } else {
      console.log(Date().toString().slice(15, 25), "未登录用户离线");
      return "未登录用户离线";
    }
  }

  userSeat(socketId) {
    if (this.socketIdToUser[socketId].isSeat) {
      this.socketIdToUser[socketId].isSeat = false;
      hList.playerList.splice(hList.playerList.indexOf(this.socketIdToUser[socketId]), 1);
      console.log("站起来" + this.socketIdToUser[socketId].name);
    } else {
      this.socketIdToUser[socketId].isSeat = true;
      hList.playerList.push(this.socketIdToUser[socketId]);
      console.log("坐下了" + this.socketIdToUser[socketId].name);
    }

    let data = new Data("updata");
    data.playerList = hList.playerList;
    data.hList = hList;
    myEmitter.emit("Send_Sth", data);
  }

  welcomeback(you: User) {
    game.welcomeback(you);
  }

  joinRoom(name) { }
  joinGame(name) { }

  /**
   * 随机字符串
   */
  idgen(): string {
    const _printable: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 22; i++) {
      text += _printable.charAt(Math.floor(Math.random() * _printable.length));
    }
    return text;
  }





}




// 测试数据
export let userListTestdata: User[] = [
  new User("传说中的第1人"),
  new User("我是本届总统"),
  new User("玩家K"),
  new User("微波史密斯"),
  new User("希特勒"),
  new User("-( ゜- ゜)つロ乾杯~"),
  new User("这个人的名字有十个字"),
  new User("真·皇冠鸟"),
  new User("这人被枪毙了"),
  new User("第八人"),
  new User("阿依吐拉公主"),

];


export function getdate() {

  userListTestdata[8].isSurvival = false;
  userListTestdata[4].isOnline = false;



  return userListTestdata;
}
