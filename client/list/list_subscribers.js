Template.listSubscribers.helpers({

    interests: function() {
        return Interests.find({ listId: this._id });
    },
    subscribers: function() {

        return Session.get('subscribers');

    },
    getListId: function() {
        return this._id;
    },
    totalSubscribers: function() {
        return Session.get('totalSubscribers');
    },
    // percentageCustomers: function() {
    //   numberCustomers = Subscribers.find({listId: this._id, nb_products: { $gt: 0 } }).fetch().length;
    //   numberEmails = Subscribers.find({listId: this._id}).fetch().length;
    //   if (numberEmails != 0) {
    //     return (numberCustomers/numberEmails*100).toFixed(2);
    //   }
    //   else {
    //     return 0;
    //   }
    // },
    // percentageSequence: function() {
    //   numberSequence = Subscribers.find({listId: this._id, sequenceId: { $not: null } }).fetch().length;
    //   numberEmails = Subscribers.find({listId: this._id}).fetch().length;
    //   if (numberEmails != 0) {
    //     return (numberSequence/numberEmails*100).toFixed(2);
    //   }
    //   else {
    //     return 0;
    //   }
    // },
    showList: function() {
        return Session.get('showList');
    }

});

Template.listSubscribers.events({

    'click #add-subscriber': function() {

        // Get data
        var email = $('#subscriber-email').val();
        var selectedInterests = Session.get('selectedInterests');

        // Add
        Meteor.call('addManualSubscriber', email, selectedInterests, this._id);

        // Get all subscribers
        Meteor.call('getTotalSubscribersList', this._id, function(err, data) {
            Session.set('totalSubscribers', data);
        });

        // Get subscribers
        Meteor.call('getLatestSubscribers', this._id, function(err, data) {
            console.log(err);
            Session.set('subscribers', data);
        });

    },
    'click #delete-subscriber': function() {

        // Get data
        var email = $('#delete-subscriber-email').val();

        // Add
        Meteor.call('removeSubscriber', email, this._id);

    },
    'click #find-subscriber': function() {

        // Get data
        var email = $('#find-subscriber-email').val();

        // Search
        Meteor.call('getSubscribers', { email: email, listId: this._id }, function(err, data) {

            Session.set('subscribers', data);

        });

    },
    'click #show-all': function() {

        // Show
        Meteor.call('getLatestSubscribers', this._id, function(err, data) {
            Session.set('subscribers', data);
        });

    },
    'click #remove-subscribers': function() {

        // Remove all
        Meteor.call('removeSubscribersList', this._id);

    },
    'change .interest': function() {

        // Selected interests
        var selectedInterests = [];

        // Interests
        var interests = Interests.find({}).fetch();

        // Get value of all category filters
        for (i = 0; i < interests.length; i++) {
            if ($("#" + interests[i]._id).is(':checked')) {
                selectedInterests.push(interests[i]._id);
            }
        }

        // Set
        Session.set('selectedInterests', selectedInterests);
    }

    // 'click #show-list': function() {

    //   var state = Session.get('showList');

    //   if (state == true) {
    //     $('#show-list').text("Show List Details");
    //       Session.set('showList', false);
    //   }
    //   else {
    //     $('#show-list').text("Hide List Details");
    //     Session.set('showList', true);
    //   }

    // }

});

Template.listSubscribers.rendered = function() {

    var listId = this.data._id;

    // Get all subscribers
    Meteor.call('getTotalSubscribersList', listId, function(err, data) {
        Session.set('totalSubscribers', data);
    });

    // Get subscribers
    Meteor.call('getLatestSubscribers', listId, function(err, data) {
        console.log(err);
        Session.set('subscribers', data);
    });

    Session.set('showList', true);

    Session.set('selectedInterests', []);

}
