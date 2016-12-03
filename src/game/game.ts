export class Game {
    proList: Array<number>;     // 待选法案堆

    theGame = null; // 游戏状态，是否开始，影响到能否加入游戏等
    skillList = []; // 技能列表


    proIndex = 16; // 牌堆顶
    proEffBlue = 0; // 法案生效数
    proEffRed = 0;
    failTimes = 0; // 政府组件失败次数



    constructor(name: string) {
        // 法案牌生成
        for (let i = 0; i <= 16; i++) {
            this.proList[i] = i;
        }
    }
}
