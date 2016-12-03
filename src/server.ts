// var path = require("path");
// var express = require("express");
// var app = express();
// var server = require("http").createServer(app);
// console.log(path.resolve("dist"));
//
// app.use("/", express.static(path.resolve("dist")));
// server.listen(80);
//
//


let io = require("socket.io").listen(81);
import { UserService } from "./user";
import { Game } from "./game/game";
import { User } from "./user/user";
let userService = new UserService();
class Data {

    constructor(
        private type: string,
        private name?: string,
        private userLsit?: Array<string>,
        private msg?: string,
        private user?: User,
    ) { }

}


class Msg {

    constructor(public msg: string, public obj?: string, public data?: string) { }
}


io.on("connection", socket => {

    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket.on("login", (name) => {

        console.log(Date().toString().slice(15, 25), "login", name);


        console.log(userService.roomLsit[0]);

        io.emit("upDataList", userService.roomLsit);
        io.emit("loginSuccess", new Data(this.type = "login", this.msg = userService.login(socket, name), this.name = name));


    });

    socket.on("disconnect", () => {
        console.log(socket.id, "离线");

        Data["msg"] = userService.logout(socket.id);
        Data["userLsit"] = userService.userLsit;
        Data["type"] = "logout";
        io.emit("upDataList", userService.roomLsit);
        io.emit("system", Data);


    });


    socket.on("system", (type, data) => {


        switch (type) {
            case "gamestart":
                console.log("游戏开始");



                io.emit("system", new Data("gamestart"));
                break;

            default:

        }


    });






});
