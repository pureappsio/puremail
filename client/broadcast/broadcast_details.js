Template.broadcastDetails.helpers({

  getOpened: function() {
    var opened = Stats.find({broadcastId: this._id, event: 'opened'}).fetch().length;
    if (opened != 0) {
      return ((opened/this.recipients)*100).toFixed(2);
    }
    else {
      return 0;
    }
  },
  getClicked: function() {
    var clicked = Stats.find({broadcastId: this._id, event: 'clicked'}).fetch().length;
    if (clicked != 0) {
      return ((clicked/this.recipients)*100).toFixed(2);
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
