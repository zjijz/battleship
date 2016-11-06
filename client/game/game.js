import { Meteor } from 'meteor/meteor';
import { Games } from '../../collections/games';

Template.game.onCreated(function() {
    this.getId = () => FlowRouter.getParam('_id');
    this.autorun(() => {
        this.subscribe('game', this.getId());
    });
});

Template.game.events({
    'click .player'(event) {
        if (!event.target || !event.target.attributes[1]) return;

        // Retrieve X,Y pair
        const pair = event.target.attributes[1].value.split(':');

        if (Template.instance().game.state_player.state < 10)
            Meteor.call('moveGameState', Template.instance().game._id, parseInt(pair[0]), parseInt(pair[1]));
    },

    'click .computer'(event) {
        if (Template.instance().game.state_player.state == 10) {
            // Do work
        }
    }
});

Template.game.helpers({
    game() {
        const game = Games.findOne({ _id: Template.instance().getId() });
        Template.instance().game = game;
        return game;
    }
});