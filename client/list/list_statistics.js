Template.listStatistics.helpers({

    getRules: function() {
        return Automations.find({ listId: this._id }, { sort: { 'sequenceId': 1 } });
    },
    sequences: function() {
        return Sequences.find({ listId: this._id });
    },
    broadcasts: function() {
        return Broadcasts.find({ listId: this._id });
    }

});
