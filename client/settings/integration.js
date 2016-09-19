Template.integration.events({

  'click .delete': function () {

    Meteor.call('deleteIntegration', this._id);

  }

});

Template.integration.helpers({

  listName: function() {

  	return Lists.findOne(this.list).name;

  }

});
