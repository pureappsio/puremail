Meteor.methods({

    getListSubscribers: function(listId) {

        return Subscribers.find({ listId: listId }).fetch();

    },
    getTotalSubscribersList: function(listId) {

        return Subscribers.find({ listId: listId }).fetch().length;

    },
    getSubscribersStats: function(subscriberId, event) {
        return Stats.find({ subscriberId: subscriberId, event: event }).fetch().length;
    },
    getMailHistory: function(subscriberId) {
        return Stats.find({
            subscriberId: subscriberId,
            event: 'delivered',
            ruleId: { $exists: true }
        }, {
            sort: { date: -1 }
        }).fetch();
    }

});
