import { Meteor } from 'meteor/meteor';

import { Games } from '../collections/games';

Meteor.publish('game', function(gameId) {
    return Games.find({ _id: gameId });
});
