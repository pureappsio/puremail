Meteor.methods({

    getRandomColor: function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },
    getInterestsGraphData: function(listId) {

        var now = new Date();
        var limitDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

        // Get interests
        var interests = Interests.find({ listId: listId }).fetch();
        var interestsLabels = [];
        var subscribersInterest = [];
        var colors = [];

        for (i in interests) {
            interestsLabels.push(interests[i].name);
            var subscribers = Subscribers.find({ date_added: { $gte: limitDate }, tags: interests[i]._id }).count();
            subscribersInterest.push(subscribers);
            colors.push(Meteor.call('getRandomColor'));
        }


        var data = {
            labels: interestsLabels,
            datasets: [{
                data: subscribersInterest,
                backgroundColor: colors,
                hoverBackgroundColor: colors
            }]
        };

        console.log(data.datasets);

        return data;

    },

    getSubscribersCount: function(listId) {

        var now = new Date();
        var limitDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

        return Subscribers.aggregate(
            [
                { $match: { listId: listId, date_added: { $gte: limitDate } } }, {
                    $group: {
                        _id: {
                            "year": {
                                "$substr": ["$date_added", 0, 4]
                            },
                            "month": {
                                "$substr": ["$date_added", 5, 2]
                            },
                            "day": {
                                "$substr": ["$date_added", 8, 2]
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
    },
    getGraphSubscribers: function(listId) {

        var subscribers = Meteor.call('getSubscribersCount', listId);

        data = [];

        console.log(subscribers);

        for (i in subscribers) {

            dataPoint = {}

            dataPoint.y = parseInt(subscribers[i].count);
            var date = subscribers[i]._id.year + '-' + subscribers[i]._id.month + '-' + subscribers[i]._id.day;
            console.log(date);
            dataPoint.x = new Date(date);

            data.push(dataPoint);

        }

        // Sort
        data.sort(date_sort);



        return data;

    },
    getGraphData: function(listId) {

        var subscribers = Meteor.call('getGraphSubscribers', listId);

        console.log(subscribers);

        var data = {
            datasets: [{
                label: 'Subscribers',
                fill: false,
                data: subscribers,
                pointHoverBackgroundColor: "darkblue",
                pointHoverBorderColor: "darkblue",
                pointBorderColor: "darkblue",
                backgroundColor: "darkblue",
                borderColor: "darkblue"
            }]
        };

        return data;

    },

    getListSubscribers: function(listId) {

        return Subscribers.find({ listId: listId }).fetch();

    },
    getTotalSubscribersList: function(listId) {

        return Subscribers.find({ listId: listId }).count();

    },
    getSubscribersStats: function(subscriberId, event) {
        return Stats.find({ subscriberId: subscriberId, event: event }).count();
    },
    getMailHistory: function(subscriberId) {
        return Stats.find({
            subscriberId: subscriberId,
            event: 'delivered',
            ruleId: { $exists: true }
        }, {
            sort: { date: -1 }
        }).fetch();
    },
    getListStats: function(listId, option) {

        var now = new Date();
        var limitDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

        if (option == 'openrate') {

            var opened = Stats.find({ date: { $gte: limitDate }, listId: listId, event: 'opened' }).count();
            var delivered = Stats.find({ date: { $gte: limitDate }, listId: listId, event: 'delivered' }).count();

            return opened / delivered * 100;
        }

        if (option == 'clickrate') {

            var opened = Stats.find({ date: { $gte: limitDate }, listId: listId, event: 'opened' }).count();
            var clicked = Stats.find({ date: { $gte: limitDate }, listId: listId, event: 'clicked' }).count();

            return clicked / opened * 100;
        }

    },
    getSequencesStats: function(listId) {

        var now = new Date();
        var limitDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

        var sequences = Sequences.find({ listId: listId }).fetch();

        for (i in sequences) {

            var opened = Stats.find({ date: { $gte: limitDate }, sequenceId: sequences[i]._id, event: 'opened' }).count();
            var delivered = Stats.find({ date: { $gte: limitDate }, sequenceId: sequences[i]._id, event: 'delivered' }).count();
            var clicked = Stats.find({ date: { $gte: limitDate }, sequenceId: sequences[i]._id, event: 'clicked' }).count();

            sequences[i].openRate = 0
            sequences[i].clickRate = 0;

            if (delivered != 0) {
                sequences[i].openRate = opened / delivered * 100;
            }
            if (opened != 0) {
                sequences[i].clickRate = clicked / opened * 100;
            }
        }

        return sequences;

    }

});

function date_sort(a, b) {
    return new Date(a.x).getTime() - new Date(b.x).getTime();
}
