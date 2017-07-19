Template.header.helpers({

    demoIndicator: function() {

        if (Session.get('demoMode')) {
            return 'Demo';
        }

    },
    email: function() {
        return Meteor.user().emails[0].address;
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

Template.header.events({

    'click #log-out': function() {
        Meteor.logout();
    }

});
