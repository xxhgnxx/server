import { Game } from "./game/game";
import { User } from "./user";
import { UserService } from "./user";

export class Pack {
    userServiceBak: UserService;
    gameBak: Game;
    constructor() {
        this.userServiceBak = new UserService();
        this.gameBak = new Game();
    }
}
