import { Meteor } from 'meteor/meteor';

import { Games, GameState } from '../collections/games';
import { createComputerState } from './computer';

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
     * Initialize player game state after pieces are placed.
     */
    createGameState() {

    },

    /**
     *
     *
     * @param x The x coordinate of the attack.
     * @param y The y coordinate of the attack.
     * @returns {boolean} True is a hit, false if a miss.
     */
    attack(x, y) {
        return false;
    }
});
