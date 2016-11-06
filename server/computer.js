import * as Game from '../collections/games';
import { Games, GameState, Piece } from '../collections/games';

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
    state.state = Game.STATE_COMPUTER;

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
    }

    return state;
};

/**
 * Abstracted attack code. Can be used by either computer or player.
 *
 * @param gameId Game to be edited.
 * @param state The state to be edited by an attack.
 * @param oppState The attacking player's state.
 * @param x The X coordinate of the attack.
 * @param y The Y coordinate of the attack.
 * @returns { hit: Game.ATTACK_MISS || Game.ATTACK_HIT, win: state} Returns the result of the attack for adding a move to history and if the game is a win state.
 */
export const makeAttack = function(gameId, state, oppState, x, y) {
    /*
     * Improvements:
     * - Have only one update that has a query built out as the method runs
     */

    const stateStr = state + '.state';
    const oppStateStr = oppState + '.state';
    const piecesStr = state + '.pieces';

    const game = Games.findOne({ _id: gameId });

    // Block more clicks on frontend
    Games.update({ _id: gameId }, { $inc: { [stateStr]: 1, [oppStateStr]: -1 } });

    let pieces = game[state].pieces;
    if (pieces[x][y].hit != Game.ATTACK_NONE) {
        Games.update({_id: gameId},
            {
                $inc: { [stateStr]: -1, [oppStateStr]: 1 }
            });
        return { hit: null, win: null };
    } else {
        // Change hit to miss or hit
        const oldPiece = pieces[x][y];
        oldPiece.hit = oldPiece.type != Game.NONE_TYPE ? Game.ATTACK_HIT : Game.ATTACK_MISS;
        pieces[x][y] = oldPiece;

        // See if a ship needs to be decremented
        const rawType = pieces[x][y].type;
        let shipType;
        if (rawType == Game.CARRIER_TYPE) {
            shipType = Game.CARRIER_STATE;
        } else if (rawType == Game.BATTLESHIP_TYPE) {
            shipType = Game.BATTLESHIP_STATE;
        } else if (rawType == Game.CRUISER_TYPE) {
            shipType = Game.CRUISER_STATE;
        } else if (rawType == Game.SUBMARINE_TYPE) {
            shipType = Game.SUBMARINE_STATE;
        } else if (rawType == Game.DESTROYER_TYPE) {
            shipType = Game.DESTROYER_STATE;
        }
        if (shipType) {
            shipType = state + '.' + shipType;
            Games.update({ _id: gameId }, { $inc: { [shipType]: -1 } });
        }

        // Set pieces and reset game state
        Games.update({_id: gameId},
            {
                $set: { [piecesStr]: pieces },
                $inc: { [stateStr]: -1, [oppStateStr]: 1 }
            });

        // Check win state
        const winState = checkWinState(gameId);

        return { hit: pieces[x][y].hit, win: checkWinState(gameId)};
    }
};

/**
 * Picks a location for the computer to attack.
 *
 * @param gameId Id of the game being played.
 */
export const computerAttack = function(gameId) {
    let x, y, cont = true, attack;
    while (cont) {
        x = parseInt(Math.random() * 9) + 1;
        y = parseInt(Math.random() * 9) + 1;

        attack = makeAttack(gameId, 'state_player', 'state_computer', x, y);

        if (attack.hit) cont = false;
    }

    // Attack message
    Games.update({ _id: gameId },
        { $push: { moves_history: 'Computer attacked (' + (y + 1) + ', ' + (x + 1) + ') for a '
                    + (attack.hit == Game.ATTACK_HIT ? 'hit.' : 'miss.') } });

    if (attack.win) {
        const state = (attack.win == 'state_player' ? 12 : 13);
        Games.update({ _id: gameId }, {
            $set: { 'state_player.state': state, 'state_computer.state': state },
            $push: { moves_history: (state == 12 ? 'You have' : 'Computer has') + ' won the game!' }
        });
    }
};

/**
 * Checks if a player has won.
 *
 * @param gameId Id of the game to check.
 * @returns {null || 'state_player' || 'state_computer} Null if no one has won or the state that won.
 */
export const checkWinState = function(gameId) {
    const game = Games.findOne({ _id: gameId });

    for (let i = 0; i < 2; i++) {
        const state = (i == 0 ? 'state_player' : 'state_computer');

        if (game[state][Game.CARRIER_STATE] + game[state][Game.BATTLESHIP_STATE] + game[state][Game.CRUISER_STATE]
            + game[state][Game.SUBMARINE_STATE] + game[state][Game.DESTROYER_STATE] == 0)
            return (i == 0 ? 'state_computer' : 'state_player');
    }

    return null;
};