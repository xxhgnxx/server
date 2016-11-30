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

let userService = new UserService();

class Msg {

    constructor(public msg: string, public obj?: string, public data?: string) { }
}


io.on("connection", socket => {

    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);



    socket.on("login", (socket, name) => {

        console.log(Date().toString().slice(15, 25), "login", name);
        io.emit("loginSuccess", userService.login(socket, name), name);


    });

    socket.on("disconnect", socket => {
        console.log(socket["name"]);

        if (socket["name"]) {
            userService.logout(socket["name"]);
            console.log(Date().toString().slice(15, 25), "logout", socket["name"]);
            socket.emit("system", new Msg("logout", socket["name"]));
        } else {
            console.log(Date().toString().slice(15, 25), "未登录logout");
        }



    });


});
