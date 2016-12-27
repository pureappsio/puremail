Template.listUsageDetails.helpers({

  scheduledEmails: function() {
    return (Scheduled.find({listId: this._id}).fetch()).length;
  },
  openRate: function() {

    return Session.get('openRate' + this._id);

  },
  clickRate: function() {
    return Session.get('clickRate' + this._id);
  }

});

Template.listUsageDetails.rendered = function() {

    // Get open rate
    var delivered = 0;
    var opened = 0;
    var clicked = 0;

    var listId = this.data._id;
    Meteor.call('getListSubscribers', listId, function (err, data) {

      console.log(data);

      for (j = 0; j < data.length; j++) {
        if (data[j].delivered) {delivered++};
        if (data[j].opened) {opened++};
        if (data[j].clicked) {clicked++};
      }

      // Open rate
      if (delivered == 0) {
        openRate = 0;
      }
      else {openRate = (opened/delivered*100).toFixed(2);}

      Session.set('openRate' + listId, openRate);

      // Click rate
      if (opened == 0) {
        clickRate = 0;
      }
      else {clickRate = (clicked/opened*100).toFixed(2);}

      Session.set('clickRate' + listId, clickRate);

    });

}
