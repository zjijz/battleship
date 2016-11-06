import { Meteor } from 'meteor/meteor';

import * as Game from '../collections/games';
import { Games, GameState, Piece } from '../collections/games';
import { createComputerState, makeAttack, computerAttack } from './computer';

const checkFieldSelection = function(pieces, direction, x, y, length) {
    switch (direction) {
        case 'up':
            ret = x - length + 1 >= 0;
            for (let i = x - length + 1; ret && (i < x); i++)
                if (pieces[i][y].type != Game.NONE_TYPE) return false;
            return ret;
        case 'down':
            ret = x + length <= Game.BOARD_SIZE;
            for (let i = x + 1; ret && (i < x + length); i++)
                if (pieces[i][y].type != Game.NONE_TYPE) return false;
            return ret;
        case 'left':
            ret = y - length + 1 >= 0;
            for (let i = y - length + 1; ret && (i < y); i++)
                if (pieces[x][i].type != Game.NONE_TYPE) return false;
            return ret;
        case 'right':
            ret = y + length <= Game.BOARD_SIZE;
            for (let i = y + 1; ret && (i < y + length); i++)
                if (pieces[x][i].type != Game.NONE_TYPE) return false;
            return ret;
    }
};

const setFieldSelection = function(pieces, x, y, type, length, up, down, left, right) {
    for (let i = x - length + 1; up && (i < x); i++)
        pieces[i][y] = new Piece(type);

    for (let i = x + 1; down && (i < x + length); i++)
        pieces[i][y] = new Piece(type);

    for (let i = y - length + 1; left && (i < y); i++)
        pieces[x][i] = new Piece(type);

    for (let i = y + 1; right && (i < y + length); i++)
        pieces[x][i] = new Piece(type);
};

const checkDirSelection = function(pieces, x, y, type) {
    return pieces[x][y].type == type;
};

const setDirSelection = function(pieces, x, y, type) {
    let original_type = '' + pieces[x][y].type;
    for (let i = x + 1; i < Game.BOARD_SIZE; i++)
        if (pieces[i][y].type == original_type)
            pieces[i][y] = new Piece(type);
        else
            break;

    for (let i = x - 1; i >= 0; i--)
        if (pieces[i][y].type == original_type)
            pieces[i][y] = new Piece(type);
        else
            break;

    for (let i = y + 1; i < Game.BOARD_SIZE; i++)
        if (pieces[x][i].type == original_type)
            pieces[x][i] = new Piece(type);
        else
            break;

    for (let i = y - 1; i >= 0; i--)
        if (pieces[x][i].type == original_type)
            pieces[x][i] = new Piece(type);
        else
            break;

    pieces[x][y] = new Piece(type);
};

const resetLightPieces = function(pieces, resetType) {
    for (let i = 0; i < Game.BOARD_SIZE; i++)
        for (let j = 0; j < Game.BOARD_SIZE; j++)
            if (pieces[i][j].type == resetType ) pieces[i][j] = new Piece(Game.NONE_TYPE);
};

const setSelector = function(gameId, pieces, x, y, length, light_type, type, message) {
    const up = checkFieldSelection(pieces, 'up', x, y, length);
    const down = checkFieldSelection(pieces, 'down', x, y, length);
    const left = checkFieldSelection(pieces, 'left', x, y, length);
    const right = checkFieldSelection(pieces, 'right', x, y, length);

    if ((!up && !down && !left && !right) || (pieces[x][y].type != Game.NONE_TYPE)) {
        Games.update({ _id: gameId },
            { $push: { moves_history: 'You cannot place the ship there.' } });
        return;
    }

    setFieldSelection(pieces, x, y, light_type, length, up, down, left, right);
    pieces[x][y] = new Piece(type);
    Games.update({ _id: gameId },
        { $set: { 'state_player.pieces': pieces }, $inc: { 'state_player.state': 1 },
            $push: { 'moves_history': message } });
};

const setDir = function(gameId, pieces, x, y, light_type, type, message) {
    if (checkDirSelection(pieces, x, y, light_type)) {
        setDirSelection(pieces, x, y, type);
        resetLightPieces(pieces, light_type);
        Games.update({ _id: gameId },
            { $set: { 'state_player.pieces': pieces }, $inc: { 'state_player.state': 1 },
                $push: { moves_history: message }  });
    }
};

Meteor.methods({
    /**
     * Create a new game on the server.
     *
     * @returns {string} The _id of the newly created game;
     */
    createGame() {
        return Games.insert({
            state_player: new GameState(),
            state_computer: createComputerState(),
            moves_history: ['Pick a place for your carrier.']
        });
    },

    /**
     * Move up the game state when setting up the player board.
     *
     * @param gameId The id of the current game.
     * @param x X coordinate of the selection.
     * @param y Y coordinate of the selection.
     */
    moveGameState(gameId, x, y) {
        const game = Games.findOne({ _id: gameId });

        let pieces = game.state_player.pieces;
        switch (game.state_player.state) {
            case 0:
                setSelector(gameId, pieces, x, y, Game.CARRIER_LENGTH, Game.CARRIER_LIGHT_TYPE,
                            Game.CARRIER_TYPE, 'Pick a direction for your carrier.');
                break;
            case 2:
                setSelector(gameId, pieces, x, y, Game.BATTLESHIP_LENGTH, Game.BATTLESHIP_LIGHT_TYPE,
                            Game.BATTLESHIP_TYPE, 'Pick a direction for your battleship.');
                break;
            case 4:
                setSelector(gameId, pieces, x, y, Game.CRUISER_LENGTH, Game.CRUISER_LIGHT_TYPE,
                    Game.CRUISER_TYPE, 'Pick a direction for your cruiser.');
                break;
            case 6:
                setSelector(gameId, pieces, x, y, Game.SUBMARINE_LENGTH, Game.SUBMARINE_LIGHT_TYPE,
                    Game.SUBMARINE_TYPE, 'Pick a direction for your submarine.');
                break;
            case 8:
                setSelector(gameId, pieces, x, y, Game.DESTROYER_LENGTH, Game.DESTROYER_LIGHT_TYPE,
                    Game.DESTROYER_TYPE, 'Pick a direction for your destroyer.');
                break;
            case 1:
                setDir(gameId, pieces, x, y, Game.CARRIER_LIGHT_TYPE, Game.CARRIER_TYPE,
                    'Pick a position for your battleship.');
                break;
            case 3:
                setDir(gameId, pieces, x, y, Game.BATTLESHIP_LIGHT_TYPE, Game.BATTLESHIP_TYPE,
                    'Pick a position for your cruiser.');
                break;
            case 5:
                setDir(gameId, pieces, x, y, Game.CRUISER_LIGHT_TYPE, Game.CRUISER_TYPE,
                    'Pick a position for your submarine.');
                break;
            case 7:
                setDir(gameId, pieces, x, y, Game.SUBMARINE_LIGHT_TYPE, Game.SUBMARINE_TYPE,
                    'Pick a position for your destroyer.');
                break;
            case 9:
                setDir(gameId, pieces, x, y, Game.DESTROYER_LIGHT_TYPE, Game.DESTROYER_TYPE,
                    'Select an attack on the computer\'s board.');
                break;
            default:
                break;
        }
    },

    /**
     * Launch an attack against the opponent.
     *
     * @param x The x coordinate of the attack.
     * @param y The y coordinate of the attack.
     */
    attack(gameId, x, y) {
        const attack = makeAttack(gameId, 'state_computer', 'state_player', x, y);
        if (attack.hit) {
            // Update move
            Games.update({_id: gameId}, {
                $push: {
                    moves_history: 'Player attacked (' + (y + 1) + ', ' + (x + 1)
                    + ') for a ' + (attack.hit == Game.ATTACK_HIT ? 'hit.' : 'miss.')
                }
            });

            if (attack.win) {
                const state = (attack.win == 'state_player' ? 12 : 13);
                Games.update({ _id: gameId }, {
                    $set: { 'state_player.state': state, 'state_computer.state': state, 'state_player.complete': true,
                            'state_computer.complete': true },
                    $push: { moves_history: (state == 12 ? 'You have' : 'Computer has') + ' won the game!' }
                });
            } else {
                // Call computer attack
                computerAttack(gameId);
            }
        } else {
            Games.update({ _id: gameId }, {
                $push: {
                    moves_history: 'You have already made an attack on that location. Please pick a different one.'
                }
            });
        }
    }
});
