Template.lists.helpers({

  lists: function() {
    return Lists.find({});
  }

});

Template.lists.events({

  'click #new-list': function() {

    Meteor.call('addNewList', $('#list-name').val());

  }

});
