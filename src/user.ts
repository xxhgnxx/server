// 用户 数据结构
export class User {
  socketId: string = "x";
  isOnline: boolean = true;
  isSurvival: boolean = true;
  isSeat: boolean = false;
  seatNo: number = 0;
  name: string;
  videoFree = true;
  headPic:number
  hitler: User;
  fascist1: User;
  fascist2: User;
  fascist3: User;
  password: string;
  isLastPre: boolean = false;
  isLastPrm: boolean = false;
  isPre: boolean = false;
  isPrm: boolean = false;
  isTmpPrm: boolean = false;
  isHitler: boolean = false;
  isFascist: boolean = false;
  role: string = "x";
  canBeSelect: boolean = true;
  lastVote: number;  // 最后一次生效的投票情况
  constructor(name: string) {
    this.name = name;
    this.headPic = Math.round(Math.random() * 12);
  }
}
