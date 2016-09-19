// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

Meteor.methods({

  cleanScheduled: function() {

    // Remove all broadcast emails
    Scheduled.remove({type: 'broadcast'});

  },
  clearScheduledSequence: function(sequenceId) {

    // Remove all from this sequence
    Scheduled.remove({sequenceId: sequenceId});

  },
  clearNotConfirmed: function() {

    // Go through all users
    var users = Meteor.users.find({}).fetch();

    for (i = 0; i < users.length; i++) {

      // Find all subscribers for this user
      var subscribers = Subscribers.find({ownerId: users[i]._id}).fetch();

      for (j = 0; j < subscribers.length; j++) {

        // Check if confirmed
        if (subscribers[j].confirmed == false) {

          // Delete
          var subscribeDate = (subscribers[j].date_added).getTime();
          var currentDate = (new Date()).getTime();

          if ((currentDate - subscribeDate) > 1000 * 60 * 10) {
            Subscribers.remove(subscribers[j]._id);
            console.log('Removing non-confirmed subscriber ' + subscribers[j].email);
          }

        }

      }

    }

  },
  sendTestEmail: function(listId, testEmailData) {

    console.log('Sending test email to: ' + testEmailData.to);
    console.log('For list: ' + listId);

    // Get host
    if (process.env.ROOT_URL == "http://localhost:3000/") {
      host = process.env.ROOT_URL;
    }
    else {
      host = "http://" + Meteor.settings.hostURL + "/";
    }

    // Add unsubscribe data
    testEmailData.html += "<p><a style='color: gray;' href='" + host + "unsubscribe?s='>Unsubscribe</a></p>";

    // Get list
    list = Lists.findOne(listId);

    testEmailData.unique_args = {
      'testArg' : 'justatest'
    };

    // Build mail
    var helper = sendgridModule.mail;
    from_email = new helper.Email(list.brandEmail);
    to_email = new helper.Email(testEmailData.to);
    subject = testEmailData.subject;
    content = new helper.Content("text/html", testEmailData.html);
    mail = new helper.Mail(from_email, subject, to_email, content);

    mail.from_email.name = list.userName;
    mail.addCustomArg({'subscriberId': 'someTestId'});

    // Send
    var requestBody = mail.toJSON()
    var request = sendgrid.emptyRequest()
    request.method = 'POST'
    request.path = '/v3/mail/send'
    request.body = requestBody
    sendgrid.API(request, function (err, response) {
      if (response.statusCode != 202) {
        console.log(response.body);
      }
    });

  }
});
