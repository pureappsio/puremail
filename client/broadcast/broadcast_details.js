Template.broadcastDetails.helpers({

  getOpened: function() {
    if (this.opened) {
      return ((this.opened/this.recipients)*100).toFixed(2);
    }
    else {
      return 0;
    }
  },
  getClicked: function() {
    if (this.clicked) {
      return ((this.clicked/this.recipients)*100).toFixed(2);
    }
    else {
      return 0;
    }
  }

});

Template.broadcastDetails.events({

  'click .broadcast-delete': function(event, template) {

    Meteor.call('deleteBroadcast', template.data._id);

  }

});
