FlowRouter.route('/', {
    action: function() {
        console.log('At landing...');
        BlazeLayout.render('application', { main: 'new' });
    },
    name: 'landing'
});

FlowRouter.route('/game/:_id', {
    action: function(params) {
        console.log('At game...');
        BlazeLayout.render('application', { main: 'game' });
    },
    name: 'game'
});