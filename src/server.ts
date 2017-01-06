let io = require("socket.io").listen(81);
import { UserService } from "./userService";
import { Game } from "./game";
import { User } from "./user";
import { VoteSys } from "./vote";
import { Data } from "./data";
// import { MsgData } from "./data";
import { Msg } from "./data";
import { Userlisthgn } from "./userList";
export let hList: Userlisthgn = new Userlisthgn();
export let userService = new UserService();
export let game: Game = new Game();
import { myEmitter } from "./myEmitter";
let socketIdtoSocket = new Map();
let yaml = require("js-yaml");

io.on("connection", socket => {
  console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
  socket.emit("ok");
  socketIdtoSocket[socket.id] = socket;
  socket.on("disconnect", () => {
    console.log(Date().toString().slice(15, 25), socket.id, "离线");
    socketIdtoSocket.delete(socket.id);
    let dataOut = new Data("logout");
    dataOut.other = userService.logout(socket.id);
    dataOut.hList = hList;
    myEmitter.emit("Send_Sth", dataOut);
  });

  socket.on("system", (data: Data) => {
    console.log("收到客户端发来的system请求", data.type, socket.id);
    io.emit(data.key);
    switch (data.type) {
      case "login":
        {
          console.log(Date().toString().slice(15, 25), "try to login", data.name);
          userService.login(socket, data);
          break;
        }
      case "quickLogin":
        {
          console.log(Date().toString().slice(15, 25), "try to quickLogin", data.id);
          userService.quickLogin(socket, data);
          break;
        }
      case "userSeat":
        {
          console.log(Date().toString().slice(15, 25), "尝试坐下", socket.id);
          userService.userSeat(socket.id);
          break;
        }
      case "gamestart":
        {
          console.log(Date().toString().slice(15, 25), "游戏开始");
          game.start(socket.id);
          break;
        }
      case "prmSelect":
        {
          console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
          game.setPrm(data.user);
          break;
        }
      case "player_vote":
        {
          console.log(Date().toString().slice(15, 25), userService.socketIdToUser[socket.id].name, "投票了");
          game.getVote(socket.id, data.voteRes);
          break;
        }
      case "proSelect":
        {
          game.findPro(data.proX3List, data.pro);
          break;
        }
      case "invPlayer":
        {
          game.invPlayer(data.target);
          break;
        }
      case "toKill":
        {
          game.toKill(data.target);
          break;
        }
      case "preSelect":
        {
          game.selectPre(data.user, true);
          break;
        }
      case "speak_end":
        {
          myEmitter.emit("speak_end");
          break;
        }
      case "veto_all":
        {
          if (typeof data.other === "undefined") {
            let dataOut = new Data("veto_all");
            dataOut.msg = new Msg("playerCP", "总理向总统提出了否决全部法案的建议，等待总统决定", "prm_CP", "veto_all", "pre_CP_veto_all");
            io.emit("system", dataOut);
            game.changestepWho(41);
            break;
          } else {

            if (data.other) {
              console.log("同意否决");
              let dataOut1 = new Data("通知");
              dataOut1.other = data.other;
              dataOut1.msg = new Msg("playerCP", "总统同意了总理全部否决的提议，本届政府失效", "prm_CP", "veto_all", "veto_all");
              io.emit("system", dataOut1);


              game.veto_all();

            } else {
              console.log("反对否决");
              // todo  通知玩家
              let dataOut = new Data("veto_all");
              dataOut.other = data.other;
              dataOut.msg = new Msg("playerCP", "总统反对了全部否却的提议，总理仍然要选择一张法案生效", "prm_CP", "veto_all", "not_veto_all");
              io.emit("system", dataOut);
              game.changestepWho(51);

            }



          }
          break;
        }


      // 普通文字消息
      case "sendMsg":
        {
          console.log(Date().toString().slice(15, 25), socket.id, "发言");
          // let dataOut = new MsgData(userService.socketIdToUser[socket.id]);
          // dataOut.msgFrom = userService.socketIdToUser[socket.id];
          // dataOut.msg = data.msg;
          // io.emit("system", dataOut);
          break;
        }

      default:
        console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
    }

  });
});





myEmitter.on("speak_start", () => {
  // 通知所有玩家 进入发言状态
  console.log("speak_start");
  let data = new Data("speak_start");
  // data.msg = new Msg("system", "玩家顺序发言开始，请切换到“发言界面查看发言”");
  myEmitter.emit("Send_Sth", data);
  speakAll();
  async function speakAll() {
    await speakPlease(game.pre);
    myEmitter.emit("Send_Sth", new Data("someone_speak_end"));
    if (game.prm.isSurvival) {
      await speakPlease(game.prm);
      myEmitter.emit("Send_Sth", new Data("someone_speak_end"));
    }
    let preNo = hList.playerList.indexOf(game.pre);
    console.log("总统编号", preNo);
    for (let i = 0; i < hList.playerList.length; i++) {
      if (!hList.playerList[preNo].isPre && !hList.playerList[preNo].isPrm && hList.playerList[preNo].isSurvival) {
        await speakPlease(hList.playerList[preNo]);
        myEmitter.emit("Send_Sth", new Data("someone_speak_end"));
      }
      if (preNo === hList.playerList.length - 1) {
        preNo = 0;
      } else {
        preNo++;
      }
    }
    myEmitter.emit("speak_endAll");
  }
  function speakPlease(who: User) {
    // let msgDataToAll = new MsgData(who);
    // msgDataToAll.type = "newPlayerSpeak";
    // msgDataToAll.speakTime = game.speakTime;
    // msgDataToAll.whoIsSpeaking = who;
    // myEmitter.emit("Send_Sth", msgDataToAll);
    console.log("发言消息发送", who.name);

    return new Promise(resolve => {
      let this_timer = setTimeout(() => {
        myEmitter.removeListener("speak_end", () => {
        });
        resolve("时间到,发言结束");
      }, game.speakTime * 1000);
      myEmitter.once("speak_end", () => {
        clearTimeout(this_timer);
        resolve("对方主动结束发言");
      });
    });
    // .then((x) => {
    //   // test
    //   let data = new Data("someone_speak_end");
    //   myEmitter.emit("Send_Sth", data);
    // });
  }

});

myEmitter.on("Push_msg", (user: User, msg: Msg) => {
  let data = new Data("Push_msg");
  data.msg = msg;
  socketIdtoSocket[user.socketId].emit("system", data);
});
myEmitter.on("Updata_msg", (user: User, msg: Msg) => {
  let data = new Data("Updata_msg");
  data.msg = msg;
  socketIdtoSocket[user.socketId].emit("system", data);
});

myEmitter.on("Send_Sth", (data) => {
  if (typeof data.toWho === "undefined") {
    console.log("发给所有人", data.type);
    data.toWho = hList.userList;
  }

  if (Array.isArray(data.toWho)) {
    for (let v_toWho of data.toWho) {
      if (typeof data.hList !== "undefined") {
        hList.yourself = v_toWho;
        data.hList = yaml.safeDump(hList);
      }
      socketIdtoSocket[v_toWho.socketId].emit("system", data);
    }
  } else {
    if (typeof data.hList !== "undefined") {
      data.hList.yourself = data.toWho;
      data.hList = yaml.safeDump(data.hList);
    }
    socketIdtoSocket[data.toWho.socketId].emit("system", data);
  }
});
//
// function send(data: Data) {
//   if (typeof data.toWho === "undefined") {
//     console.log("发给所有人", data.type);
//     io.emit("system", data);
//     return;
//   }
//   if (Array.isArray(data.toWho)) {
//     for (let v_toWho of data.toWho) {
//       socketIdtoSocket[v_toWho.socketId].emit("system", data);
//     }
//   } else {
//     socketIdtoSocket[data.toWho.socketId].emit("system", data);
//   }
// }
