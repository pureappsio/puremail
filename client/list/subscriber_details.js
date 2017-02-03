Template.subscriberDetails.rendered = function() {

    console.log('Data: ');
    console.log(this.data);

    // Subscriber data
    if (this.data._id) {

        Meteor.call('getSubscriber', this.data._id, function(err, subscriber) {

            Meteor.call('getPurchasedProducts', subscriber, function(err, products) {

                Session.set('productsBoughts', products);

            });

            // Create stats
            Meteor.call('getSubscribersStats', subscriber._id, 'delivered', function(err, data) {
                Session.set('delivered', data);
            });

            Meteor.call('getSubscribersStats', subscriber._id, 'opened', function(err, data) {
                Session.set('opened', data);
            });

            Meteor.call('getSubscribersStats', subscriber._id, 'clicked', function(err, data) {
                Session.set('clicked', data);
            });

            // Mail history
            Meteor.call('getMailHistory', subscriber._id, function(err, data) {
                console.log(data);
                Session.set('mailHistory', data);
            });

            // console.log(data);

            Session.set('subscriberData', subscriber);

            console.log(subscriber);

            // Get sequences
            Meteor.call('getSequences', subscriber.listId, function(err, sequences) {

                console.log(sequences);

                for (i in sequences) {
                    $('#sequences').append($('<option>', {
                        value: sequences[i]._id,
                        text: sequences[i].name
                    }));
                }

                $('#sequences').append($('<option>', {
                    value: 'none',
                    text: "No sequence"
                }));

            });

        });

    }

};

Template.subscriberDetails.events({

    'click #assign-sequence': function() {

        // Get sequence
        var sequence = $('#sequences :selected').val();

        // Assign subscriber
        Meteor.call('assignSequenceManual', this._id, sequence);

    },
    'click #move-sequence': function() {

        // Assign subscriber
        Meteor.call('moveNextEmail', this._id);

    }

});

Template.subscriberDetails.helpers({

    tags: function() {
        if (Session.get('subscriberData').tags) {
            return Interests.find({ _id: { $in: Session.get('subscriberData').tags } });
        }
    },
    subscriber: function() {

        return Session.get('subscriberData');

    },
    offers: function() {

        return Offers.find({ subscriberId: this._id });

    },
    nb_products: function() {
        return Session.get('productsBoughts').length;
    },
    products: function() {
        return Session.get('productsBoughts');
    },
    interests: function() {

        if (Session.get('subscriberData')) {
            return Session.get('subscriberData').tags;
        }

    },
    numberDelivered: function() {

        return Session.get('delivered');

    },
    numberOpened: function() {

        return Session.get('opened');

    },
    numberClicked: function() {

        return Session.get('clicked');
    },
    mailHistory: function() {
        return Session.get('mailHistory');
    },
    sequenceName: function() {
        if (Session.get('subscriberData').sequenceId == null) {
            return "Not currently in a sequence"
        } else {
            return Sequences.findOne(Session.get('subscriberData').sequenceId).name;
        }
    },
    sequenceEmailNumber: function() {
        if (Session.get('subscriberData').sequenceEmail == null) {
            return "Not currently in a sequence"
        } else {
            return Automations.findOne(Session.get('subscriberData').sequenceEmail).order;
        }
    },
    lastActive: function() {
        return moment(Session.get('subscriberData').last_updated).format('MMMM Do YYYY, hh:mm');
    }

});
