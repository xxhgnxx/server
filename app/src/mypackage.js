"use strict";
var game_1 = require("./game/game");
var user_1 = require("./user");
var Pack = (function () {
    function Pack() {
        this.userServiceBak = new user_1.UserService();
        this.gameBak = new game_1.Game();
    }
    return Pack;
}());
exports.Pack = Pack;
