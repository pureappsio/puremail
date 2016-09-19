Template.usage.helpers({

  lists: function() {
    return Lists.find({});
  }

});

Template.usage.events({

  'click #clean-scheduled': function() {
    var listId = $('#list-id').val();
    Meteor.call('cleanScheduled', listId);
  }

});
