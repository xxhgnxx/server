
import { User }  from "./user";
import { game } from "../server";




export class UserService {

    userLsit = new Array<User>();
    gameLsit = new Array<User>();
    socketIdToUser = new Map<string, User>();
    constructor() { }



    login(socketId, name) {
        let me = this.userLsit.filter(t => { return t.name === name; })[0];
        if (me) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.socketIdToUser[socketId] = me;
            this.socketIdToUser[socketId].isOnline = true;
            return this.socketIdToUser[socketId].name + "欢迎归来";
        } else {
            console.log(Date().toString().slice(15, 25), "用户新加入", name);
            this.socketIdToUser[socketId] = new User(name);
            this.userLsit.push(this.socketIdToUser[socketId]);
            return "欢迎加入";
        }
    }


    logout(socketId): string {

        if (this.socketIdToUser[socketId]) {
            this.socketIdToUser[socketId].isOnline = false;
            this.socketIdToUser.delete(socketId);
            console.log(Date().toString().slice(15, 25), this.socketIdToUser[socketId].name, "离线");
            return this.socketIdToUser[socketId].name + "离线";
        } else {
            console.log(Date().toString().slice(15, 25), "未登录用户离线");
            return "未登录用户离线";
        }
    }


    userSeat(socketId, name): string {







        if (this.socketIdToUser[socketId].isSeat) {
            this.socketIdToUser[socketId].isSeat = false;
            game.userList.splice(game.userList.indexOf(this.socketIdToUser[socketId]), 1);
            return "站起来" + name;
        } else {
            this.socketIdToUser[socketId].isSeat = true;
            game.userList.push(this.socketIdToUser[socketId]);
            return "坐下了" + name;

        }







    }



    joinRoom(name) { }
    joinGame(name) { }




}
