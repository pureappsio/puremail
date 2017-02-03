Template.condition.events({

  'click .delete-condition': function () {

    Meteor.call('deleteCondition', this._id);

  }

});

Template.condition.helpers({

  productName: function() {
  	return Meteor.call('getProductName', this.parameter, this.listId);
  }

});