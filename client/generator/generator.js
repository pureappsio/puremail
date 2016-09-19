Template.generator.helpers({
  emailTemplate: function() {

    var baseTemplate = Session.get('emailTemplate');

    // Add list
    var selectedList = Session.get('selectedList');
    baseTemplate += '<input type="hidden" name="list" value="' + selectedList + '"/>';

    // Add interests
    var selectedInterests = Session.get('selectedInterests');
    for (j = 0; j < selectedInterests.length; j++) {
      baseTemplate += '<input type="hidden" name="interests" value="' + selectedInterests[j] + '"/>';
    }

    // Add origins
    var selectedOrigins = Session.get('selectedOrigins');
    for (j = 0; j < selectedOrigins.length; j++) {
      baseTemplate += '<input type="hidden" name="origin" value="' + selectedOrigins[j] + '"/>';
    }

    endTemplate = '';
    endTemplate += '<input type="submit" name="submit" id="submit" value="Subscribe" />';
    endTemplate += '</form>';

    return baseTemplate + endTemplate;

  },
  interests: function() {
    return Interests.find({});
  },
  lists: function() {
    return Lists.find({});
  }
});

Template.generator.rendered = function() {

  // List
  Session.set('selectedList', $('#list-select').val());

  // Basic template
  emailTemplate = '';
  emailTemplate += '<form action="http://' + $(location).attr('host') + '/subscribe" method="POST" accept-charset="utf-8">';
  emailTemplate += '<input placeholder="Your email ..." type="text" name="email" id="email"/>';
  emailTemplate += '<br/>';

  Session.set('emailTemplate', emailTemplate);
  Session.set('selectedInterests', []);
  Session.set('selectedOrigins', []);

};

Template.generator.events({

  'change #list-select': function() {

    // Set
    Session.set('selectedList', $('#list-select').val());
    console.log($('#list-select').val());

  },
  'change .interest': function() {

    // Selected interests
    var selectedInterests = [];

    // Interests
    var interests = Interests.find({}).fetch();

    // Get value of all category filters
    for (i = 0; i < interests.length; i++) {
      if ($("#" + interests[i]._id).is(':checked')) {
        selectedInterests.push(interests[i].name);
      }
    }

    // Set
    Session.set('selectedInterests', selectedInterests);
  },

  'change .origin': function() {

    // Selected interests
    var selectedOrigins = [];

    // Get values
    if ($("#blog").is(':checked')) {
      selectedOrigins.push('blog');
    }

    if ($("#amazon").is(':checked')) {
      selectedOrigins.push('amazon');
    }

    // Set
    Session.set('selectedOrigins', selectedOrigins);
  }

});
