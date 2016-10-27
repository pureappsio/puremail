Template.list.helpers({

  subscribers: function() {
    return Subscribers.find({listId: this._id});
  },
  interests: function() {
    return Interests.find({listId: this._id});
  },
  unsubscribe: function() {
    if (this.unsubscribe) {
      return this.unsubscribe;
    }
  },
  signUpThankYou: function() {
    if (this.signUpThankYou) {
      return this.signUpThankYou;
    }
  },
  finalThankYou: function() {
    if (this.finalThankYou) {
      return this.finalThankYou;
    }
  },
  brandName: function() {
    if (this.brandName) {
      return this.brandName;
    }
  },
  brandEmail: function() {
    if (this.brandEmail) {
      return this.brandEmail;
    }
  },
  yourName: function() {
    if (this.userName) {
      return this.userName;
    }
  }

});

Template.list.events({

  'click #set-brand': function () {

    Meteor.call('setBrand', this._id, $('#brand-name').val(), $('#brand-email').val(), $('#your-name').val());

  },
  'click #set-language': function () {

    Meteor.call('setLanguage', this._id, $('#language :selected').val());

  },
  'click #set-confirmation': function () {

    Meteor.call('setConfirmationEmail', this._id, $('#confirmation :selected').val());

  },
  'click #set-email': function () {

    Meteor.call('setEmailPreferences', this._id, $('#signup-thank-you').val(), $('#final-thank-you').val(), $('#unsubscribe').val());

  },
  'click #add-interest': function () {

    // Add interest
    Meteor.call('addInterest', this._id, $('#interest').val());

  }


});
