let io = require("socket.io").listen(81);
import { UserService } from "./userService";
import { Game } from "./game";
import { User } from "./user";
import { VoteSys } from "./vote";
import { Data } from "./data";

export let userService = new UserService();
export let game: Game = new Game();
export let votesys: VoteSys = new VoteSys();


let socketIdtoSocket = new Map();



io.on("connection", socket => {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);

    socket.on("disconnect", () => {
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
        socketIdtoSocket.delete(socket.id);
        let dataOut = new Data();
        dataOut.type = "logout";
        dataOut.msg = userService.logout(socket.id);
        dataOut.playerList = userService.userList;
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
                    dataOut.userList = userService.userList;
                    dataOut.toWho = userService.userList;
                    send(dataOut);
                    break;
                }
            case "userSeat":
                {
                    console.log(Date().toString().slice(15, 25), "尝试坐下", data.name);
                    // let dataOut = new Data();
                    // dataOut.msg = userService.userSeat(socket.id);
                    // dataOut.type = "userSeat";
                    // dataOut.user = userService.socketIdToUser[socket.id];
                    // io.emit("system", dataOut);
                    // break;
                }
            case "gamestart":
                {
                    ////////////////////// 未完成功能
                    console.log(Date().toString().slice(15, 25), "游戏开始");
                    if (data = game.start(socket.id)) {
                        // io.emit("system", data);
                        send(data);
                    } else {
                        console.log("人数不足");
                    }
                    break;
                }
            case "prmSelect":
                {
                    console.log(Date().toString().slice(15, 25), "选择了总理", data.user.name);
                    send(game.setPrm(data.user));
                    break;
                }
            case "vote":
                {
                    console.log(Date().toString().slice(15, 25), userService.socketIdToUser[socket.id].name, "投票了");
                    send(game.getVote(socket.id, data.voteRes));
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





function findPro(list?: Array<number>) {
    // game.findPro(list);
    // let dataOut = new Data();
    // dataOut.type = "choosePro";
    // let tmp = game.playerList.filter(t => {
    //     return t.isPre !== true;
    // });
    // dataOut.proList = game.proList;
    // dataOut.proIndex = game.proIndex;
    // send(tmp, dataOut);
    // dataOut.proX3List = game.proX3List;
    // send(game.pre, dataOut);
}


function proSelect(proDiscard, list) {
send(game.proSelect(proDiscard, list));
    // let dataOut = new Data();
    // if (game.proSelect(proDiscard, list)) {
    //     console.log("法案生效");
    //     dataOut.type = "proEff";
    //     dataOut.pro = game.pro;
    //     send(game.playerList, dataOut);
    //     if (game.started) {
    //         console.log("通知选总理");
    //         let dataOut = new Data();
    //         dataOut.playerList = game.playerList;
    //         dataOut.pre = game.pre;
    //         dataOut.prenext = game.prenext;
    //         dataOut.type = "selectPrm";
    //         dataOut.pre = game.pre;
    //         send(game.playerList, dataOut);
    //     } else {
    //         console.log("游戏结束");
    //     }
    // } else {
    //     console.log("告知总理选法案");
    //     let tmp = game.playerList.filter(t => {
    //         return t.isPrm !== true;
    //     });
    //     send(tmp, dataOut);
    //     dataOut.proX3List = game.proX3List;
    //     send(game.prm, dataOut);
    // }

}



function send(data: Data | Array<Data>) {


    if (Array.isArray(data)) {
        for (let v_data of data) {

            if (Array.isArray(v_data.toWho)) {
                for (let v_toWho of v_data.toWho) {
                    socketIdtoSocket[v_toWho.socketId].emit("system", v_data);
                }
            } else {
                socketIdtoSocket[v_data.toWho.socketId].emit("system", v_data);
            }


        }


    } else {

        if (Array.isArray(data.toWho)) {
            for (let v_toWho of data.toWho) {
                socketIdtoSocket[v_toWho.socketId].emit("system", data);
            }
        } else {
            socketIdtoSocket[data.toWho.socketId].emit("system", data);
        }

    }

}
