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
    Meteor.call('assignSequenceManual', this._id, sequence);

  },
  'click #move-sequence': function() {

    // Assign subscriber
    Meteor.call('moveNextEmail', this._id);

  }

});

Template.subscriberDetails.helpers({

  nb_products: function() {
    return this.products.length;
  },
  // productName: function() {
  //   return Meteor.call('getProductName', this.product)
  // }
  interests: function() {

    console.log(this);

    if (this.interests) {
      return this.interests;
    }
  },
  numberDelivered: function() {

    var delivered = Stats.find({subscriberId: this._id, event: 'delivered'}).fetch().length;
    return delivered;
 
  },
  numberOpened: function() {

    var opened = Stats.find({subscriberId: this._id, event: 'opened'}).fetch().length;
    return opened;

  },
  numberClicked: function() {

    var clicked = Stats.find({subscriberId: this._id, event: 'clicked'}).fetch().length;
    return clicked;

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
