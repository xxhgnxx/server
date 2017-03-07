"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VoteSys = (function () {
    function VoteSys() {
        this.voteList = new Array();
        this.votes = new Array();
    }
    VoteSys.prototype.setNewVote = function (list) {
        var votes = new Array();
        for (var i = 0; i < list.length; i++) {
            if (list[i].isSurvival) {
                votes[list[i].seatNo] = 0;
            }
        }
        this.count = 0;
        this.voteList.push(votes);
        this.votes = votes;
    };
    VoteSys.prototype.getVote = function (seatNo, res) {
        this.votes[seatNo] = res;
        this.count = this.count + 1;
        if (this.count === this.votes.length) {
            return true;
        }
        else {
            return false;
        }
    };
    VoteSys.prototype.getRes = function (seatNo, res) {
        var tmp = 0;
        for (var i = 0; i < this.votes.length; i++) {
            tmp = tmp + this.votes[i];
        }
        return tmp;
    };
    return VoteSys;
}());
exports.VoteSys = VoteSys;
