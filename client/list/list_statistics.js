Template.listStatistics.helpers({

    getRules: function() {
        return Automations.find({ listId: this._id }, { sort: { 'sequenceId': 1 } });
    },
    sequences: function() {
        return Session.get('sequences');
    },
    broadcasts: function() {
        return Broadcasts.find({ listId: this._id }, {sort: {time: -1}, limit: 5});
    },
    openRate: function() {

        return Session.get('openRate').toFixed(2);

    },
    clickRate: function() {

        return Session.get('clickRate').toFixed(2);

    }

});

Template.listStatistics.onRendered(function() {

    // Get open rate for list
    if (this.data) {

        // Origin
        Meteor.call('getInterestsGraphData', this.data._id, function(err, graphData) {

            var chart = document.getElementById("interests-chart");

            var myPieChart = new Chart(chart, {
                type: 'pie',
                data: graphData
            });

        });

        Meteor.call('getGraphData', this.data._id, function(err, graphData) {

            var ctx = document.getElementById("subscribers-chart");

            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: graphData,
                options: {
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        }]
                    }
                }
            });

        });

        Meteor.call('getListStats', this.data._id, 'openrate', function(err, data) {
            Session.set('openRate', data);
        });

        Meteor.call('getListStats', this.data._id, 'clickrate', function(err, data) {
            Session.set('clickRate', data);
        });

        Meteor.call('getSequencesStats', this.data._id, function(err, data) {
            Session.set('sequences', data);
        });
    };

});
