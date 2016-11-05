import { Mongo } from 'meteor/mongo';

export const BOARD_SIZE = 10;

export const CARRIER_LENGTH = 5;
export const BATTLESHIP_LENGTH = 4;
export const CRUISER_LENGTH = 3;
export const SUBMARINE_LENGTH = 3;
export const DESTROYER_LENGTH = 2;

// I don't think enums are supported in base ES6 yet
export const NONE_TYPE = 'none';
export const CARRIER_TYPE = 'carrier';
export const BATTLESHIP_TYPE = 'battleship';
export const CRUISER_TYPE = 'cruiser';
export const SUBMARINE_TYPE = 'submarine';
export const DESTROYER_TYPE = 'destroyer';

export const STATE_PICK_CARRIER = 0;
export const STATE_PICK_CARRIER_DIR = 1;
export const STATE_PICK_BATTLESHIP = 2;
export const STATE_PICK_BATTLESHIP_DIR = 3;
export const STATE_PICK_CRUISER = 4;
export const STATE_PICK_CRUISER_DIR = 5;
export const STATE_PICK_SUBMARINE = 6;
export const STATE_PICK_SUBMARINE_DIR = 7;
export const STATE_PICK_DESTROYER = 8;
export const STATE_PICK_DESTROYER_DIR = 9;
export const STATE_NORMAL = 10;

export const ATTACK_HIT = 1;
export const ATTACK_NONE = 0;
export const ATTACK_MISS = -1;

export class Piece {
    constructor(type) {
        this.hit = ATTACK_NONE;
        this.type = type;
    }
}

export class GameState {
    constructor() {
        this.pieces = GameState._resetPieces();
        this.carrier_left = CARRIER_LENGTH;
        this.battleship_left = BATTLESHIP_LENGTH;
        this.cruiser_left = CRUISER_LENGTH;
        this.submarine_left = SUBMARINE_LENGTH;
        this.destroyer_left = DESTROYER_LENGTH;
        this.moves = [];
        this.state = STATE_PICK_CARRIER;
    }

    /**
     * @private
     *
     * Initializes the board to an empty 10x10.
     *
     * @return {Piece[]}
     */
     static _resetPieces() {
        let pieces = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            let row = [];
            for (let j = 0; j < BOARD_SIZE; j++)
                row.push(new Piece(NONE_TYPE));
            pieces.push(row);
        }
        return pieces;
    }
}

/*
 * Schema:
 * _id: Game _id for routing
 * state_player: GameState
 * state_computer: GameState
 * moves_history: String[]
 */
export const Games = new Mongo.Collection('games');
