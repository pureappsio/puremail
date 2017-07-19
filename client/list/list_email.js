Template.listEmail.helpers({

    locationStyle: function() {

        if (this.location) {

            return 'flag-icon-' + (this.location).toLowerCase();

        } else {
            return 'flag-icon-us';
        }

    },
    fromDate: function() {
        return moment(this.date_added).fromNow();
    },
    isCustomer: function() {
        if (this.nb_products > 0) {
            return true;
        } else {
            return false;
        }
    },
    isUser: function() {
        if (this.origin == 'application' || this.origin == 'app') {
            return true;
        } else {
            return false;
        }
    },
    originName: function() {
        if (this.origin) {

            if (this.origin == 'blog' || this.origin == 'organic') {
                return 'ORGANIC';
            } else if (this.origin == 'ads') {
                return 'ADS';
            } else if (this.origin == 'social') {
                return 'SOCIAL';
            } else {
                return 'ORGANIC';
            }

        } else {
            return 'ORGANIC';
        }
    },
    originColor: function() {
        if (this.origin) {

            if (this.origin == 'blog' || this.origin == 'organic') {
                return 'badge-warning';
            } else if (this.origin == 'landing') {
                return 'badge-primary';
            } else if (this.origin == 'social') {
                return 'badge-info';
            } else {
                return 'badge-warning';
            }

        } else {
            return 'badge-warning';
        }
    },
    isNotConfirmed: function() {
        if (this.confirmed == false) {
            return true;
        } else {
            return false;
        }
    },
    isKindleCustomer: function() {
        if (this.origin) {
            if (this.origin == 'amazon') {
                return true;
            }
            return false;
        } else {
            return false;
        }
    },
    tags: function() {
        if (this.tags) {
            return Interests.find({ _id: { $in: this.tags } });
        }
    }
});

Template.listEmail.events({
    'click .delete': function(event, template) {

        // Delete
        Meteor.call('deleteSubscriber', template.data._id);

        // Get all subscribers
        Meteor.call('getTotalSubscribersList', template.data.listId, function(err, data) {
            Session.set('totalSubscribers', data);
        });

        // Get subscribers
        Meteor.call('getLatestSubscribers', template.data.listId, function(err, data) {
            console.log(err);
            Session.set('subscribers', data);
        });

    }
});
