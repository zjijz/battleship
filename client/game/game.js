import { Games } from '../../collections/games';

Template.game.onCreated(function() {
    this.getId = () => FlowRouter.getParam('_id');
    this.autorun(() => {
        this.subscribe('game', this.getId());
        console.log(Games.find().fetch());
    });
});

Template.game.events({
    'click .player'(event) {
        console.log(event)
    },

    'click .computer'(event) {
        console.log(event);
    }
});

Template.game.helpers({
    game() {
        return Games.findOne({ _id: Template.instance().getId() });
    }
});