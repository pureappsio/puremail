Template.listsReport.rendered = function() {

  // Get all lists
  var lists = Lists.find({}).fetch();

  var listsDistribution = [];

  for (i in lists) {
    var listData = [];
    listData.push(lists[i].name);
    var subscribers = Subscribers.find({listId: lists[i]._id}).fetch();
    listData.push(subscribers.length);
    listsDistribution.push(listData);
  }

  Session.set('listsDistribution', listsDistribution);

}

Template.listsReport.listsDistribution = function() {

    return {
      chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Lists Distribution'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Lists Distribution',
            data: Session.get('listsDistribution')
        }]
    };
};
