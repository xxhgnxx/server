import { User } from "./user";
export class MsgServices {
    msgListAll = new Array<any>(); // 总发言记录
    msgListNow = new Array<any>(); // 当前发言记录

    newPlayerSpeak(player: User) {
        let tmp = new Array<any>();
        tmp.push(player);
        this.msgListAll.push(tmp);
        this.msgListNow = tmp;
    }

}
