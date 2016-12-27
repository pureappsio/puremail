Template.deleteConfirm.events({

  'click .delete-modal': function(e) {

    // Delete
    e.preventDefault();
    var listId = this.data._id;
    if ($('#listName-' + this.data._id).val() == this.data.name) {
      Meteor.call('deleteList', listId);
      Modal.hide('deleteConfirm');
      $('.modal-backdrop').remove();
    }

  }

});
