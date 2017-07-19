SyncedCron.config({
    log: false
});

SyncedCron.add({
    name: 'Send scheduled emails',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 5 seconds');
    },
    job: function() {
        Meteor.call('sendScheduled');
    }
});

SyncedCron.add({
    name: 'Re-send not-opened broadcast emails',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 hour');
    },
    job: function() {
        Meteor.call('reSendBroadcasts');
    }
});

SyncedCron.add({
    name: 'Delete not-confirmed subscribers',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 day');
    },
    job: function() {
        Meteor.call('clearNotConfirmed');
    }
});

SyncedCron.add({
    name: 'Wake up dying leads',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 day at 10:00pm');
    },
    job: function() {
        Meteor.call('wakeUpDyingLeads');
    }
});

SyncedCron.add({
    name: 'Delete dead leads',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 day at 11:00pm');
    },
    job: function() {
        Meteor.call('deleteDeadLeads');
    }
});
