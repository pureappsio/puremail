Template.listDetails.events({

  'click .delete': function(e) {

    // Delete
    //Meteor.call('deleteList', this._id);
    e.preventDefault();
    $('#deleteConfirm-' + this._id).modal('show');

  }

});
