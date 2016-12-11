let io = require("socket.io").listen(81);
import { UserService } from "./user";
import { Game } from "./game/game";
import { User } from "./user";
import { Vote } from "./game/vote";
export let userService = new UserService();
export let game: Game = new Game();
export class Data {
    type: string;
    name: string;
    msg: string;
    user: User;
    userList: Array<User>;
    // 游戏数据
    playerList: Array<User>; // 加入本次游戏的玩家列表，主要用于消息发送
    proIndex = 16; // 牌堆顶
    voteList: Array<Vote>; // 投票情况
    proList = new Array<any>();  // 法案牌堆
    started: boolean = false;       // 游戏是否开始
    proEffBlue = 0; // 法案生效数
    proEffRed = 0; // 法案生效数
    failTimes = 0; // 政府组件失败次数
    fascistCount: number; // 法西斯玩家数量
    liberalCount: number; // 自由党玩家数量
    voteCount: number; // 投票数
    voteYes: number; // 投票数
    lastPre: User;
    lastPrm: User;
    pre: User;
    prenext: User;
    prm: User;
    socketId: string;
    constructor() { this.userList = userService.userList; }
}


class Msg {

    constructor(public msg: string, public obj?: string, public data?: string) { }
}

io.on("connection", socket => {

    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);


    socket.on("disconnect", () => {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        let dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = userService.logout(socket.id);
        io.emit("system", dataOut);
    });

    socket.on("system", data => {
        console.log("收到客户端发来的system请求", data);
        switch (data.type) {
            case "login":
                {
                    console.log(Date().toString().slice(15, 25), "login", data.name);
                    let dataOut = new Data();
                    dataOut.type = "loginSuccess";
                    dataOut.msg = userService.login(socket.id, data.name);
                    dataOut.user = userService.socketIdToUser[socket.id];
                    dataOut.socketId = socket.id;
                    io.emit("system", dataOut);
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
                    // let dataOut = game.start();
                    // dataOut.type = "gamestart";
                    dataOut.playerList = game.playerList;
                    dataOut.fascistCount = game.fascistCount;
                    dataOut.proIndex = game.proIndex;
                    dataOut.proList = game.proList;
                    dataOut.pre = game.pre;
                    dataOut.prenext = game.prenext;
                    dataOut.voteList = game.voteList;
                    dataOut.name = userService.socketIdToUser[socket.id];
                    dataOut.type = "gamestart";
                    io.emit("system", dataOut);
                    break;
                }

            default:
        }
    });

});
