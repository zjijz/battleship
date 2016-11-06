Template.board.helpers({
    isDone() {
        return !!(Template.currentData().state.state == 12 || Template.currentData().state.state == 13);
    }
});