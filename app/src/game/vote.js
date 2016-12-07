"use strict";
var Vote = (function () {
    function Vote(list) {
        this.votes = Array();
        for (var i = 0; i < list.length; i++) {
            if (list[i].isSurvival) {
                this.votes[list[i].seatNo] = "";
            }
        }
        this.count = 0;
    }
    Vote.prototype.getVote = function (no, res) {
        this.votes[no] = res;
        this.count = this.count + 1;
        return this.count === this.votes.length;
    };
    return Vote;
}());
exports.Vote = Vote;
