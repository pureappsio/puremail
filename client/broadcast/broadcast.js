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

Template.broadcast.helpers({

  broadcasts: function() {
    return Broadcasts.find({});
  }

});

Template.broadcast.events({

  'click #send-email': function () {

    // Get email text & subject
    var emailText = $('#email-text').summernote('code');
    var emailSubject = $('#email-subject').val();
    var listId = $('#select-option-0 :selected').val();

    // Get all filters
    index = Session.get('filterIndex');
    filters = [];

    for (i = 0; i <= index; i ++) {

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
    var listId = $('#select-option-0 :selected').val();

    // Build email data
    testEmailData = {
      to: to,
      subject: emailSubject,
      html: emailText
    };

    // Send email
    Meteor.call('sendTestEmail', listId, testEmailData);

  },
  'click #offer': function () {

    // Grab details
    var product = $('#select-product-offer :selected').text();
    var productId = $('#select-product-offer :selected').val();
    var discount = $('#discount').val();

    // Get product link
    Meteor.call('getProductData', productId, function(err, productData) {

      Meteor.call('createOffer', productId, discount, Meteor.user(), function(err, offer) {

        // Generate email text
        emailText = '<p>Hello,</p>';
        emailText += '<p>Thanks for purchasing from us in the past! ';
        emailText += 'Today, I want to reward you with an exclusive offer on ' + product + '. ';
        emailText += 'I am giving you a ' + discount + '% discount on this product. ';
        emailText += 'You can access your exclusive offer by following the link below:</p>';
        emailText += '<p><a href="' + productData.short_url + '/' + offer.name + '">' + product + '</a></p>';
        emailText += '<p>Cheers,<br>';
        emailText += Meteor.user().profile.userName + '<br>';
        emailText += Meteor.user().profile.brandName + '</p>';

        // Generate email subject
        emailSubject = 'Exclusive offer on ' + Meteor.user().profile.brandName + ' products';

        // Assign email text & subject
        $('#email-text').code(emailText);
        $('#email-subject').val(emailSubject);

      });

    });

  }

});
