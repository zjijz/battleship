import * as Game from '../collections/games';
import { GameState, Piece } from '../collections/games';

const checkTakenPieces = function(taken_pieces, point) {
    for (let i = 0; i < taken_pieces.length; i++) {
        if ((taken_pieces[i].x == point.x) && (taken_pieces[i].y == point.y)) return false;
    }
    return true;
};

/**
 * Initializes computer state.
 *
 * @returns { GameState } A GameState object (no typings since I didn't set up TS).
 */
export const createComputerState = function() {
    let state = new GameState();

    // Keep track of points used
    let taken_pieces = [];

    for (let shipInd = 0; shipInd < 5; shipInd++) {
        // Set ship type and length
        let shipType;
        let shipLength;
        switch (shipInd) {
            case 0:
                shipType = Game.CARRIER_TYPE;
                shipLength = Game.CARRIER_LENGTH;
                break;
            case 1:
                shipType = Game.BATTLESHIP_TYPE;
                shipLength = Game.BATTLESHIP_LENGTH;
                break;
            case 2:
                shipType = Game.CRUISER_TYPE;
                shipLength = Game.CRUISER_LENGTH;
                break;
            case 3:
                shipType = Game.SUBMARINE_TYPE;
                shipLength = Game.SUBMARINE_LENGTH;
                break;
            case 4:
                shipType = Game.DESTROYER_TYPE;
                shipLength = Game.DESTROYER_LENGTH;
                break;
            default:
                break;
        }

        let x = -1;
        let y = -1;
        let dir = -1; // false = L/R, true = U/D

        // Randomly select places for ships, picking random spots until ship can validly be places
        // This only lets ships go right or down from the initial point selected!
        let cont = true;
        while (cont) {
            x = parseInt(Math.random() * 9) + 1;
            y = parseInt(Math.random() * 9) + 1;
            dir = Math.random() * 2 > 1;

            cont = false;
            for (let i = 0; i < shipLength; i++)
                if ((dir && (x + i >= Game.BOARD_SIZE)) || (!dir && (y + i >= Game.BOARD_SIZE))
                    || !checkTakenPieces(taken_pieces, { x: x + (dir ? i : 0), y: y + (dir ? 0 : i) })) {
                    cont = true;
                    break;
                }
        }

        // Set ship
        for (let i = 0; i < shipLength; i++) {
            let point = { x: x + (dir ? i : 0), y: y + (dir ? 0 : i) };
            taken_pieces.push(point);
            state.pieces[point.x][point.y] = new Piece(shipType);
        }

        console.log(taken_pieces);
    }

    console.log(state.pieces);

    return state;
};

/**
 * Picks a location for the computer to attack.
 *
 * @param gameState The current computer state
 * @returns {{x: number, y: number}} Coordinates for next attack
 */
export const pickAttack = function(gameState) {
    return { x: 0, y: 0};
};