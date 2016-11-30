
import { User }  from "./user";





export class UserService {
    userLsit = [];
    admin = new User("admin");
    roomLsit = [];
    gameLsit = [];
    socketLsit = [];
    constructor() {
        this.userLsit[this.admin.name] = this.admin;
    }

    login(socket, name) {
        this.socketLsit[socket.id] = name;
        if (this.userLsit[name]) {
            console.log(Date().toString().slice(15, 25), "返回", name);
            this.userLsit[name].isOnline = true;
            return "欢迎归来";
        } else {
            console.log(Date().toString().slice(15, 25), "新建", name);
            this.userLsit[name] = new User(name);
            return "欢迎加入";
        }
    }


    logout(name) {

        console.log(Date().toString().slice(15, 25), "离线", name);

        this.userLsit[name].isOnline = false;
        return "欢迎归来";


    }
    joinRoom(name) { }
    joinGame(name) { }
    upDataList() {

        return this.userLsit;


    }


}
