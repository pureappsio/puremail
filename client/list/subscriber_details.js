Template.subscriberDetails.rendered = function() {

  // Get sequences
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

  // Create stats
  Meteor.call('getSubscribersStats', this.data._id, 'delivered', function(err, data) {
    Session.set('delivered', data);
  });

  Meteor.call('getSubscribersStats', this.data._id, 'opened', function(err, data) {
    Session.set('opened', data);
  });

  Meteor.call('getSubscribersStats', this.data._id, 'clicked', function(err, data) {
    Session.set('clicked', data);
  });

  // Mail history
  Meteor.call('getMailHistory', this.data._id, function(err, data) {
    Session.set('mailHistory', data);
  });

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

    return Session.get('delivered');
 
  },
  numberOpened: function() {

    return Session.get('opened');

  },
  numberClicked: function() {

    return Session.get('clicked');
  },
  mailHistory: function() {
    return Session.get('mailHistory');
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
  },
  lastActive: function() {
    return moment(this.last_updated).format('MMMM Do YYYY, hh:mm');
  }

});
