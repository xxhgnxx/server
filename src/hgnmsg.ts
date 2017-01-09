import { User } from "./user";


export class Msg {
  type: string;   // 类型
  step: number;
  lv: number;   // 类型
  locked: boolean;  // 锁
  time: number;  // 时间 用于计时器
  who: User;   // user
  target: User;   // user
  msgList: Array<string>;  // 列表式的文字消息
  msg: string;     // 单独的文字消息
  voteCount: number;
  nowVote: Array<number>;
  userList: Array<User>; // 用户列表
  proX3List: Array<any>;  //  法案选择列表
  role: string; // 身份；
  voteRes: number;  // 投票结果
  pro;
  prm;
  pre;
  constructor(type: string, msg?: string) {
    this.type = type;
    this.msg = msg;
  }
}
