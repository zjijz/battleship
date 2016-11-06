Template.board.helpers({
    isDone() {
        return (Template.currentData().state.complete) ? 'done' : '';
    }
});