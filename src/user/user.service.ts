
import { User }  from "./user";





export class UserService {
    userLsit = new Map();
    roomLsit = [];
    gameLsit = [];
    socketLsit = new Map();
    constructor() { }

    login(socket, name) {
        this.socketLsit[socket.id] = name;
        if (this.userLsit[name]) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.userLsit[name].isOnline = true;
            return "欢迎归来";
        } else {
            console.log(Date().toString().slice(15, 25), "新建", name);
            this.userLsit[name] = new User(name);
            this.roomLsit.push(this.userLsit[name]);
            return "欢迎加入";
        }

    }


    logout(socketId) {
        console.log(this.socketLsit[socketId]);
        if (this.socketLsit[socketId]) {
            this.userLsit[this.socketLsit[socketId]].isOnline = false;
            this.socketLsit.delete(socketId);
            return this.socketLsit[socketId] + "离线";
        } else {
            return "未登录用户离线";
        }
    }
    joinRoom(name) { }
    joinGame(name) { }
    upDataList() {

        return this.userLsit;


    }




}
