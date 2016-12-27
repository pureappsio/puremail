Template.sequence.events({

  'click .delete-sequence': function (event, template) {

    Meteor.call('deleteSequence', template.data._id);

  }

});

Template.sequence.helpers({

  emails: function() {

    return Automations.find({sequenceId: this._id}).fetch().length;

  },
  getDestination: function() {

    console.log(this.destination);

    if ($.isArray(this.destination)) {
      return 'branch';
    }
    else {
      return this.destination.action;
    }

  }

});
