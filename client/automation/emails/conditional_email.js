Template.conditionalEmail.events({

  'click .delete-email': function () {

    Meteor.call('deleteConditionalEmail', this._id);

  }

});