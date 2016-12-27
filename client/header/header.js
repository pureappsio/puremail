Template.header.helpers({

  demoIndicator: function() {

    if (Session.get('demoMode')) {
      return 'Demo';
    }

  }

});

Template.header.onRendered(function() {

  Meteor.call('getMode', function(err, mode) {
    console.log(mode);
    if (mode == 'demo') {
      Session.set('demoMode', true);
    }
  })

});