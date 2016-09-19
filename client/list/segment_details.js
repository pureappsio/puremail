Template.interestDetails.events({

  'click .glyph-delete': function() {

    Meteor.call('removeInterest', this._id);

  }

});
