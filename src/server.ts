let io = require("socket.io").listen(81);
import { UserService } from "./user";
import { Game } from "./game/game";
import { User } from "./user";
import { VoteSys } from "./game/vote";
export let userService = new UserService();
export let game: Game = new Game();
export let votesys: VoteSys = new VoteSys();

export class Data {
    type: string;
    name: string;
    msg: string;
    user: User;
    userList: Array<User>;
    // 游戏数据
    started: boolean = false;       // 游戏是否开始

    playerList: Array<User>; // 加入本次游戏的玩家列表，主要用于消息发送
    fascistCount: number; // 法西斯玩家数量
    liberalCount: number; // 自由党玩家数量

    proIndex = 16; // 牌堆顶
    proList = new Array<any>();  // 法案牌堆
    proX3List: Array<number>; // 法案牌摸的三张牌
    pro: number; // 选择弃掉的法案

    voteList: Array<Array<number>>; // 投票总记录
    nowVote: Array<number>; // 当前正在进行的投票
    voteRes: number; // 投票结果
    voteCount: number;  //  投票数量

    failTimes = 0; // 政府组件失败次数

    proEffBlue = 0; // 法案生效数
    proEffRed = 0; // 法案生效数




    lastPre: User;
    lastPrm: User;
    pre: User;
    prenext: User;
    prm: User;
    socketId: string;

    constructor() { this.userList = userService.userList; }
}

let socketIdtoSocket = new Map();

class Msg {

    constructor(public msg: string, public obj?: string, public data?: string) { }
}

io.on("connection", socket => {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket.on("disconnect", () => {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        socketIdtoSocket.delete(socket.id);
        let dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = userService.logout(socket.id);
        io.emit("system", dataOut);
    });

    socket.on("system", data => {
        console.log("收到客户端发来的system请求", data.type, socket.id);
        io.emit(data.key);
        switch (data.type) {
            case "login":
                {
                    console.log(Date().toString().slice(15, 25), "login", data.name);
                    socketIdtoSocket[socket.id] = socket;
                    let dataOut = new Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = userService.login(socket, data.name);
                    dataOut.user = userService.socketIdToUser[socket.id];
                    dataOut.socketId = socket.id;
                    send(dataOut.user, dataOut);
                    break;
                }
            case "userSeat":
                {
                    console.log(Date().toString().slice(15, 25), "尝试坐下", data.name);
                    let dataOut = new Data();
                    dataOut.msg = userService.userSeat(socket.id);
                    dataOut.type = "userSeat";
                    dataOut.user = userService.socketIdToUser[socket.id];
                    io.emit("system", dataOut);
                    break;
                }
            case "gamestart":
                {
                    ////////////////////// 未完成功能
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    game.start();
                    let dataOut = new Data();
                    dataOut.playerList = game.playerList;
                    dataOut.fascistCount = game.fascistCount;
                    dataOut.proIndex = game.proIndex;
                    dataOut.proList = game.proList;
                    dataOut.started = game.started;
                    dataOut.name = userService.socketIdToUser[socket.id];
                    dataOut.type = "gamestart";
                    send(game.playerList, dataOut);
                    selectPre(game.playerList[Math.floor(Math.random() * game.playerList.length)]);
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    game.setPrm(data.user);
                    console.log(Date().toString().slice(15, 25), "创建新投票");
                    game.setVote();
                    let dataOut = new Data();
                    dataOut.type = "pleaseVote";
                    dataOut.playerList = game.playerList;
                    dataOut.prm = game.prm;
                    dataOut.pre = game.pre;
                    dataOut.voteCount = game.voteCount;
                    dataOut.nowVote = game.nowVote;
                    send(game.playerList, dataOut);
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), userService.socketIdToUser[socket.id].name, "投票了");
                    let dataOut = new Data();
                    dataOut.type = "pleaseVote";
                    if (game.getVote(userService.socketIdToUser[socket.id].seatNo - 1, data.voteRes)) {
                        dataOut.voteRes = game.voteRes;
                        console.log("投票完成", game.voteCount + "/" + game.nowVote.length, "结果", game.voteRes + "/" + game.nowVote.length);
                        if (game.voteRes > game.nowVote.length / 2) {
                            console.log("政府组建成功");
                            findPro();


                        } else {
                            console.log("政府组建失败");
                            selectPre(game.prenext);
                        }
                    } else {
                        dataOut.nowVote = game.nowVote;
                        dataOut.voteCount = game.voteCount;
                        send(game.playerList, dataOut);
                    }
                    break;
                }
            case "proSelect":
                {

                    proSelect(data.pro, data.proX3List);


                    break;
                }

            default:
                console.log(Date().toString().slice(15, 25), "神秘的未定义请求");
        }
    });

});


function selectPre(player: User) {
    game.selectPre(player);
    let dataOut = new Data();
    dataOut.playerList = game.playerList;
    dataOut.pre = game.pre;
    dataOut.prenext = game.prenext;
    dataOut.type = "selectPrm";
    dataOut.pre = game.pre;
    send(game.playerList, dataOut);
}


function findPro(list?: Array<number>) {
    game.findPro(list);
    let dataOut = new Data();
    dataOut.type = "choosePro";
    let tmp = game.playerList.filter(t => {
        return t.isPre !== true;
    });
    dataOut.proList = game.proList;
    dataOut.proIndex = game.proIndex;
    send(tmp, dataOut);
    dataOut.proX3List = game.proX3List;
    send(game.pre, dataOut);
}


function proSelect(proDiscard, list) {
    let dataOut = new Data();
    if (game.proSelect(proDiscard, list)) {
        console.log("法案生效");
        dataOut.type = "proEff";
        dataOut.pro = game.pro;
        send(game.playerList, dataOut);
        if (game.started) {
            console.log("通知选总理");
            let dataOut = new Data();
            dataOut.playerList = game.playerList;
            dataOut.pre = game.pre;
            dataOut.prenext = game.prenext;
            dataOut.type = "selectPrm";
            dataOut.pre = game.pre;
            send(game.playerList, dataOut);
        } else {
            console.log("游戏结束");
        }
    } else {
        console.log("告知总理选法案");
        let tmp = game.playerList.filter(t => {
            return t.isPrm !== true;
        });
        send(tmp, dataOut);
        dataOut.proX3List = game.proX3List;
        send(game.prm, dataOut);
    }

}



function send(who: Array<User> | User, data) {
    if (Array.isArray(who)) {
        for (let n in who) {
            socketIdtoSocket[who[n].socketId].emit("system", data);
        }
    } else {
        socketIdtoSocket[who.socketId].emit("system", data);
    }






}
