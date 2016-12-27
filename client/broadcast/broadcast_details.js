Template.broadcastDetails.onRendered(function() {

    if (this.data._id) {

        // Get broadcast id
        var broadcastId = this.data._id;

        Meteor.call('getBroadcastStats', broadcastId, 'clicked', function(err, data) {

            Session.set('getClicked' + broadcastId, data);

        });

        Meteor.call('getBroadcastStats', broadcastId, 'opened', function(err, data) {

            Session.set('getOpened' + broadcastId, data);

        });

    }

});

Template.broadcastDetails.helpers({

    getOpened: function() {
        if (Session.get('getOpened' + this._id)) {
            return Session.get('getOpened' + this._id);
        } else {
            return 0;
        }
    },
    getClicked: function() {
        if (Session.get('getClicked' + this._id)) {
            return Session.get('getClicked' + this._id);
        } else {
            return 0;
        }
    }
});

Template.broadcastDetails.events({

    'click .broadcast-delete': function(event, template) {

        Meteor.call('deleteBroadcast', template.data._id);

    }

});
