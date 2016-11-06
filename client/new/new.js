import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

Template.new.events({
    'click button.new'(event) {
        Meteor.call('createGame', (error, result) => {
            if (!error) FlowRouter.go('/game/' + result);
            else console.log(error);
        });
    }
});
