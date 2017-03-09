// SyncedCron.add({
//   name: 'Refresh EDD data',
//   schedule: function(parser) {
//     // parser is a later.parse object
//     return parser.text('every 1 hours on the 45th minute');
//   },
//   job: function() {
//     Meteor.call('refreshAllEdd');
//   }
// });

SyncedCron.config({
  log: false
});

SyncedCron.add({
  name: 'Send scheduled emails',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 20 seconds');
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
    return parser.text('every 1 day');
  },
  job: function() {
    Meteor.call('wakeUpDyingLeads');
  }
});
