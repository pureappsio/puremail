Template.broadcast.rendered = function() {

  // Init editor
  $('#email-text').summernote({
    height: 300 // set editor height
  });

  // Init date picker
  //$('.datetimepicker').datetimepicker();
  var now = new Date();
  $('#day').val(now.getDate());
  $('#month').val(now.getMonth() + 1);
  $('#minute').val(now.getMinutes());
  $('#hour').val(now.getHours());

}

// Template.broadcast.helpers({

//   broadcasts: function() {
//     if (Session.get('broadcastListId')) {
//       return Broadcasts.find({});
//     }
//   }

// });

Template.broadcast.events({

  'click #send-email': function () {

    // Get email text & subject
    var emailText = $('#email-text').summernote('code');
    var emailSubject = $('#email-subject').val();
    var listId = $('#list :selected').val();

    // Get all filters
    index = Session.get('filterIndex');
    filters = [];

    for (i = 2; i <= index; i ++) {

      filter = {
        criteria: $('#select-criteria-' + i).val(),
        option: $('#select-option-' + i + ' :selected').val()
      }

      filters.push(filter);
    }

    // Time
    var time = new Date();
    time.setDate( parseInt( $('#day').val() ) );
    time.setMonth(parseInt( $('#month').val() ) - 1 );
    time.setHours(parseInt( $('#hour').val() ));
    time.setMinutes(parseInt( $('#minute').val() ));

    // Save broadcast email
    var broadcast = {
      subject: emailSubject,
      text: emailText,
      listId: listId,
      time: time,
      filters: filters,
      // recipients: customers.length,
      ownerId: Meteor.user()._id
    };

    Meteor.call('saveBroadcast', broadcast, function(err, broadcastId) {

      // Add emails
      Meteor.call('sendEmails', broadcastId);

    });

  },
  'click #test-email': function () {

    // Get email text & subject
    var emailText = $('#email-text').summernote('code');
    var emailSubject = $('#email-subject').val();
    var to = $('#test-to').val();
    var listId = $('#list :selected').val();

    // Build email data
    testEmailData = {
      to: to,
      subject: emailSubject,
      html: emailText
    };

    // Send email
    Meteor.call('sendTestEmail', listId, testEmailData);

  }

});
