let io = require("socket.io").listen(81);
import { UserService } from "./user";
import { Game } from "./game/game";
import { User } from "./user";
export let userService = new UserService();
export let game: Game = new Game();
export class Data {
    type: string;
    name: string;
    msg: string;
    user: User;
    constructor(
        public userLsit = userService.userLsit
    ) { }

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
                    dataOut.name = data.name;
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
                    dataOut.name = userService.socketIdToUser[socket.id];
                    io.emit("system", dataOut);
                    break;
                }

            default:
        }
    });

});
