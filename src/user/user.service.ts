
import { User }  from "./user";
import { game } from "../server";




export class UserService {
    userList = new Array<User>();
    gamelist = new Array<User>();
    socketIdToUser = new Map<string, User>();

    constructor() { }

    login(socket, name) {
        let me = this.userList.filter(t => { return t.name === name; })[0];
        if (me) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.socketIdToUser[socket.id] = me;
            this.socketIdToUser[socket.id].isOnline = true;
            this.socketIdToUser[socket.id].socketId = socket.id;
            return this.socketIdToUser[socket.id].name + "欢迎归来";
        } else {
            console.log(Date().toString().slice(15, 25), "用户新加入", name);
            this.socketIdToUser[socket.id] = new User(name);
            this.socketIdToUser[socket.id].socketId = socket.id;
            this.userList.push(this.socketIdToUser[socket.id]);
            let tmp = this.userSeat(socket.id); // 测试用
            return "欢迎加入";
        }
    }

    logout(socketId): string {
        if (this.socketIdToUser[socketId]) {
            this.socketIdToUser[socketId].isOnline = false;
            if (!game.started) {
                this.socketIdToUser[socketId].isSeat = false;
                game.playerList.splice(game.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            }
            this.socketIdToUser.delete(socketId);
            console.log(Date().toString().slice(15, 25), this.socketIdToUser[socketId].name, "离线");
            return this.socketIdToUser[socketId].name + "离线";
        } else {
            console.log(Date().toString().slice(15, 25), "未登录用户离线");
            return "未登录用户离线";
        }
    }

    userSeat(socketId): string {
        if (this.socketIdToUser[socketId].isSeat) {
            this.socketIdToUser[socketId].isSeat = false;
            game.playerList.splice(game.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            return "站起来" + this.socketIdToUser[socketId].name;
        } else {
            this.socketIdToUser[socketId].isSeat = true;
            game.playerList.push(this.socketIdToUser[socketId]);
            return "坐下了" + this.socketIdToUser[socketId].name;
        }
    }



    joinRoom(name) { }
    joinGame(name) { }




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
