import { UserService } from "../user";
import { userService } from "../server";
import { User } from "../user";
export class Game {
    proList: Array<number>;  // 法案牌堆
    started: boolean;       // 游戏是否开始
    userList: Array<User> = userService.userLsit; // 加入本次游戏的玩家列表，主要用于消息发送
    skillList = []; // 技能列表
    proIndex = 16; // 牌堆顶
    proEffBlue = 0; // 法案生效数
    proEffRed = 0; // 法案生效数
    failTimes = 0; // 政府组件失败次数
    lastPre: User;
    lastPrm: User;
    pre: User;
    prm: User;
    hitler: User;
    fascist: Array<User>;
    ziyoudang: Array<User>;
    start() {

        if (this.userList.length >= 5) {
            console.log('开始人数：', this.userList.length);

        } else {
            console.log('人数不足：', this.userList.length);
        }
    }
    setPlayer() { }
    setGame() { }
    setPro() { }
    Shuffle() { }
    setPre() { }
    setPrm() { }
    effPro() { }
    vote() { }
    preSelect() { }
    prmSelect() { }
    proSelect() { }
    tmp() { }
    back() { }
    gameOver() { }
    // 游戏状态，是否开始，影响到能否加入游戏等

    constructor() {
        // 法案牌生成
        for (let i = 0; i <= 16; i++) {
            this.proList[i] = i;
        }
    }
}
