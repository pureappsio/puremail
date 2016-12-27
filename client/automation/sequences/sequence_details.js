Template.sequenceDetails.helpers({

  emails: function() {

    return Automations.find({sequenceId: this._id}).fetch().length;

  },
  subscribersSequence: function() {
    return Subscribers.find({sequenceId: this._id}).fetch().length;
  }

});
