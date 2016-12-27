Template.settings.events({

  'click #add-integration': function () {

    var accountData = {
      type: $('#integration-type :selected').val(),
      key: $('#integration-key').val(),
      url: $('#integration-url').val(),
      ownerId: Meteor.user()._id
    };
    Meteor.call('addIntegration', accountData);

  },
  'click #refresh-integrations': function () {

    Meteor.call('refreshAllIntegrations');

  },
  'click #generate-key': function () {

    Meteor.call('generateApiKey');

  },
  'click #link-list': function() {

    Meteor.call('linkList', $('#integration-id :selected').val(), $('#list-id :selected').val());

  }

});


Template.settings.helpers({

  integrations: function() {
    return Integrations.find({});
  },
  key: function() {
    return Meteor.user().apiKey;
  },
  areIntegrations: function() {
    if (Integrations.find({}).fetch().length > 0) {
      return true;
    }
    else {
      return false;
    }
  }

});

Template.settings.rendered = function() {

  // Get lists
  var lists = Lists.find({}).fetch();

  // Set options
  for (i in lists) {
    $('#list-id').append($('<option>', {
      value: lists[i]._id,
      text: lists[i].name
    }));
  }

  // Get integrations
  Meteor.call('getIntegrations', function(err, integrations) {

    // Set options
    for (i in integrations) {
      $('#integration-id').append($('<option>', {
        value: integrations[i]._id,
        text: integrations[i].url
      }));
    }

  });

};
