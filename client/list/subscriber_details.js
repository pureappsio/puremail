Template.subscriberDetails.rendered = function() {

  var sequences = Sequences.find({listId: this.data.listId}).fetch();

  for (i in sequences) {
    $('#sequences').append($('<option>', {
      value: sequences[i]._id,
      text: sequences[i].name
    }));
  }

  $('#sequences').append($('<option>', {
    value: 'none',
    text: "No sequence"
  }));

};

Template.subscriberDetails.events({

  'click #assign-sequence': function() {

    // Get sequence
    var sequence = $('#sequences :selected').val();

    // Assign subscriber
    Meteor.call('assignSequence', this._id, sequence);

  }

});

Template.subscriberDetails.helpers({

  interests: function() {

    console.log(this);

    if (this.interests) {
      return this.interests;
    }
  },
  numberDelivered: function() {

    if (this.delivered) {
      return this.delivered;
    }
    else {
      return 0;
    }

  },
  numberOpened: function() {

    if (this.opened) {
      return this.opened;
    }
    else {
      return 0;
    }

  },
  numberClicked: function() {

    if (this.clicked) {
      return this.clicked;
    }
    else {
      return 0;
    }

  },
  sequenceName: function() {
    if (this.sequenceId == null) {
      return "Not currently in a sequence"
    }
    else {
      return Sequences.findOne(this.sequenceId).name;
    }
  },
  sequenceEmailNumber: function() {
    if (this.sequenceEmail == null) {
      return "Not currently in a sequence"
    }
    else {
      return Automations.findOne(this.sequenceEmail).order;
    }
  }

});
