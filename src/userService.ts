import { User }  from "./user";
import { game } from "./server";
import { Data } from "./data";




export class UserService {
    userList = new Array<User>();
    gamelist = new Array<User>();
    socketIdToUser = new Map<string, User>();
    NameToPass = new Map<string, string>();
    idToUser = new Map<string, string>();
    constructor() { }

    login(socket, data: Data): Data {
        let me = this.userList.filter(t => { return t.name === data.name; })[0];
        if (me) {
            console.log("用户已存在");
            if (data.pass === this.NameToPass[data.name]) {
                console.log("密码正确");
                console.log(Date().toString().slice(15, 25), "返回", data.name);

                let id = this.idgen();
                this.idToUser[id] = me;
                this.socketIdToUser[socket.id] = me;
                me.isOnline = true;
                me.socketId = socket.id;
                let dataout = new Data();
                dataout.type = "loginBack";
                dataout.id = id;
                dataout.login = true;
                dataout.socketId = socket.id;
                dataout.toWho = me;
                dataout.yourself = me;
                return dataout;



            } else {
                console.log("密码错误");
                let dataout = new Data();
                dataout.type = "passWrong";
                let tmpuser = new User(data.name);
                tmpuser.socketId = socket.id;
                dataout.toWho = tmpuser;
                return dataout;



            }




        } else {
            console.log(Date().toString().slice(15, 25), "用户新加入", data.name);
            this.socketIdToUser[socket.id] = new User(data.name);
            this.socketIdToUser[socket.id].socketId = socket.id;
            this.NameToPass[data.name] = data.pass;
            let id = this.idgen();
            this.idToUser[id] = this.socketIdToUser[socket.id];
            this.userList.push(this.socketIdToUser[socket.id]);

            let tmp = this.userSeat(socket.id); // 测试用

            let dataout = new Data();
            dataout.type = "loginSuccess";
            dataout.id = id;
            dataout.login = true;
            dataout.socketId = socket.id;
            dataout.toWho = this.socketIdToUser[socket.id];
            dataout.yourself = this.socketIdToUser[socket.id];
            return dataout;
        }
    }

    logout(socketId): string {
        if (this.socketIdToUser[socketId]) {
            this.socketIdToUser[socketId].isOnline = false;
            if (!game.started) {
                console.log("游戏没开始，从playerlist中剔除该用户");
                this.socketIdToUser[socketId].isSeat = false;
                game.playerList.splice(game.playerList.indexOf(this.socketIdToUser[socketId]), 1);
            }

            // 测试代码---------------
            this.socketIdToUser[socketId].isSeat = false;
            game.playerList.splice(game.playerList.indexOf(this.socketIdToUser[socketId]), 1);

            // 测试代码---------------

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

            return "站起来" + this.socketIdToUser[socketId].name;
        } else {
            this.socketIdToUser[socketId].isSeat = true;

            return "坐下了" + this.socketIdToUser[socketId].name;
        }
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
