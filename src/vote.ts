import { User } from "./user";
export class VoteSys {
    voteList = new Array<Array<number>>();
    votes = new Array<number>();
    count: number;

    setNewVote(list: Array<User>) {
        let votes = new Array<number>();
        for (let i = 0; i < list.length; i++) {
            if (list[i].isSurvival) {
                votes[list[i].seatNo] = 0;
            }
        }
        this.count = 0;
        this.voteList.push(votes);
        this.votes = votes;
    }

    getVote(seatNo: number, res): boolean {
        this.votes[seatNo] = res;
        this.count = this.count + 1;
        if (this.count === this.votes.length) {
            return true;
        } else {
            return false;
        }
    }

    getRes(seatNo: number, res): number {
        let tmp = 0;
        for (let i = 0; i < this.votes.length; i++) {
            tmp = tmp + this.votes[i];
        }
        return tmp;
    }


}
