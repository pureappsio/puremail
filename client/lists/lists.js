Template.lists.helpers({

  lists: function() {
    return Lists.find({}, {sort: {name: 1}});
  },
  areLists: function() {
  	if ( Lists.find({}).fetch().length > 0) {
  		return true;
  	}
  	else {
  		return false;
  	}
  },
  isDemo: function() {
  	if (Session.get('demoMode')) {
      return true;
    }
    else {
      return false;
    } 
  }

});

Template.lists.events({

  'click #new-list': function() {

    Meteor.call('addNewList', $('#list-name').val());

  }

});
