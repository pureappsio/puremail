Template.settings.events({

  'click #add-edd-account': function () {

    var accountData = {
      token: $('#edd-token').val(),
      key: $('#edd-key').val(),
      url: $('#edd-url').val(),
      list: $('#select-list :selected').val(),
    };
    Meteor.call('addEddAccount', accountData);

  },
  'click #refresh-edd': function () {

    Meteor.call('refreshAllEdd');

  }

});


Template.settings.helpers({

  integrations: function() {
    return Integrations.find({});
  }

});

Template.settings.rendered = function() {


  // Get lists
  var lists = Lists.find({}).fetch();

  // Set options
  for (i in lists) {
    $('#select-list').append($('<option>', {
      value: lists[i]._id,
      text: lists[i].name
    }));
  }

};
