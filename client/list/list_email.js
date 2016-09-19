Template.listEmail.helpers({

  fromDate: function() {
    return moment(this.date_added).fromNow();
  },
  isCustomer: function() {
    if (this.nb_products > 0) {
      return true;
    }
    else {
      return false;
    }
  },
  isUser: function() {
    if (this.origin == 'application' || this.origin == 'app') {
      return true;
    }
    else {
      return false;
    }
  },
  isBlogVisitor: function() {
    if (this.origin) {
      if (this.origin == 'blog') {
        return true;
      }
      else {
        return false;
      }
    }
  },
  isLanding: function() {
    if (this.origin) {
      if (this.origin == 'landing') {
        return true;
      }
      else {
        return false;
      }
    }
  },
  isNotConfirmed: function() {
    if (this.confirmed == false) {
      return true;
    }
    else {
      return false;
    }
  },
  isKindleCustomer: function() {
    if (this.origin) {
      if (this.origin == 'amazon') {
        return true;
      }
      return false;
    }
    else {
      return false;
    }
  },
  interests: function() {
    if (this.interests) {
      return this.interests;
    }
  }
});

Template.listEmail.events({
  'click .delete': function(event, template) {
    Meteor.call('deleteSubscriber', template.data._id);
  }
});
