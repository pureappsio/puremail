Template.broadcastListing.events({

    'click .broadcast-delete': function() {

        Meteor.call('deleteBroadcast', this._id);

    }

});

Template.broadcastListing.helpers({

    timeResent: function() {

        var sentDate = new Date(this.time);

        return new Date(sentDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    }

});
