Template.listAnalyticsDetails.helpers({

  length: function() {
    return (Subscribers.find({listId: this._id}).fetch()).length;
  },
  last: function() {

    // Build date
    var currentDate = new Date();
    currentDate = currentDate.getTime();
    currentDate = currentDate - 30 * 24 * 60 * 60 * 1000;
    currentDate = new Date(currentDate);

    var subscribers = Subscribers.find({listId: this._id, date_added: { $gte : currentDate }}).fetch();
    return subscribers.length;
  },
  change: function() {

    // Build date
    var currentDate = new Date();
    currentDate = currentDate.getTime();
    lastDate = currentDate - 30 * 24 * 60 * 60 * 1000;
    previousDate = currentDate - 60 * 24 * 60 * 60 * 1000;

    lastDate = new Date(lastDate);
    previousDate = new Date(previousDate);

    var subscribersLast = Subscribers.find({listId: this._id, date_added: { $gte : lastDate }}).fetch();
    var subscribersPrevious = Subscribers.find({listId: this._id, date_added: { $gte : previousDate,  $lte : lastDate} }).fetch();

    if (subscribersPrevious != 0) {
      var change = ((subscribersLast.length - subscribersPrevious.length) / subscribersPrevious.length) * 100;
      return change.toFixed(0);
    }
    else {
      return 0;
    }

  }

});
