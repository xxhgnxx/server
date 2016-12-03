export class User {
    isOnline: boolean = true;
    isSurvival: boolean = true;
    isSeat: boolean = false;
    seatNo: number = 0;
    name: string;
    password: string;
    isLastPre: boolean = false;
    isLastPrm: boolean = false;
    isPre: boolean = false;
    isPrm: boolean = false;
    isHitler: boolean = false;
    isFascist: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    userSetNo(n) {
        this.seatNo = n;
        console.log(this.name, "坐在了", n, "号座位上");
    }

    userSeat() {
        this.isSeat = !this.isSeat;
        console.log(this.name, this.isSeat ? "坐下了" : "离开了座位");
    }

    // userOnline() {
    //     this.isOnline = !this.isOnline;
    //     console.log(this.name, this.isOnline ? "上线了" : "离线了");
    // }

    userSurvival() {
        this.isSurvival = !this.isSurvival;
        console.log(this.name, this.isOnline ? "挂了" : "复活了？！");
    }


}
