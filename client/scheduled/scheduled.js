Template.scheduled.helpers({

    getScheduled: function() {
        return Scheduled.find({}, { sort: { date: 1 }, limit: 25 });
    },
    nbScheduled: function() {
        return Scheduled.find({}).fetch().length;
    },
    broadcasts: function() {
        return Broadcasts.find({ resent: false });
    }

});

Template.scheduled.events({

    'click #clear-broadcast': function() {
        Meteor.call('cleanScheduled');
    },
    'click #clear-sequence': function() {

        // Get sequence ID
        var sequenceId = $('#sequence-id').val();

        // Clear
        Meteor.call('clearScheduledSequence', sequenceId);
    }

});
