// Import SendGrid
import sendgridModule from 'sendgrid';
const sendgrid = require('sendgrid')(Meteor.settings.sendGridAPIKey);

Meteor.methods({

    addEmailEnding: function(text, list, type, subscriberId) {

        // Get host
        host = Meteor.absoluteUrl();

        // Add social networks if any
        if (Networks.findOne({ listId: list._id, ownerId: list.ownerId })) {

            var networks = Networks.find({ listId: list._id, ownerId: list.ownerId }).fetch();
            var networksText = "<p style='font-size: 14px; text-align: center; margin-top: 50px;'>Follow us on social media!</p><p style='text-align: center;'>";

            for (i in networks) {

                var imageLink = Meteor.absoluteUrl() + networks[i].type;
                var imageText = "<img height='32' width='32' src='" + imageLink + ".png'>";
                networksText += "<a style='margin-right: 5px; margin-left: 5px;' href='" + networks[i].url + "'>" + imageText + "</a>";

            }

            networksText += '</p>';

            text += networksText

        }

        // Add unsubscribe data
        if (list.language) {
            if (list.language == 'en') {
                var unsubscribeText = "Unsubscribe";
            }
            if (list.language == 'fr') {
                var unsubscribeText = "Se désinscrire";
            }
        } else {
            var unsubscribeText = "Unsubscribe";
        }
        if (type == 'broadcast' || type == 'test') {
            text += "<p style='margin-top: 30px; text-align: center;'><a style='color: gray;' href='" + host + "unsubscribe?s=-subscriberId-'>" + unsubscribeText + "</a></p>";
        }
        if (type == 'automation') {
            text += "<p style='margin-top: 30px; text-align: center;'><a style='color: gray;' href='" + host + "unsubscribe?s=" + subscriberId + "'>" + unsubscribeText + "</a></p>";
        }

        return text;

    },
    sendSimpleEmail: function(scheduled) {

        // Build mail
        var helper = sendgridModule.mail;
        from_email = new helper.Email(scheduled.fromEmail);
        to_email = new helper.Email(scheduled.to);
        subject = scheduled.subject;
        content = new helper.Content("text/html", scheduled.text);
        mail = new helper.Mail(from_email, subject, to_email, content);

        mail.from_email.name = scheduled.from;

        // Send
        var requestBody = mail.toJSON()
        var request = sendgrid.emptyRequest()
        request.method = 'POST'
        request.path = '/v3/mail/send'
        request.body = requestBody

        if (Meteor.settings.mode != 'demo') {
            sendgrid.API(request, function(err, response) {

                console.log('Email sent');

                if (err) { console.log(err); }

            });

        }

        // Remove
        Scheduled.remove(scheduled._id);

    },
    addManualEmail: function(emailData) {

        // Get list
        var list = Lists.findOne(emailData.listId);

        // Build entry
        var entry = {
            name: list.userName,
            ownerId: emailData.userId,
            listId: emailData.listId,
            date: new Date(emailData.date),
            to: emailData.email,
            fromEmail: list.brandEmail,
            from: list.userName,
            subject: emailData.subject,
            text: emailData.text,
            type: 'simple'
        }

        // Insert
        Scheduled.insert(entry);

    },
    cleanScheduled: function() {

        // Remove all broadcast emails
        Scheduled.remove({ type: 'broadcast' });

    },
    clearScheduledSequence: function(sequenceId) {

        // Remove all from this sequence
        Scheduled.remove({ sequenceId: sequenceId });

    },
    clearNotConfirmed: function() {

        // Go through all users
        var users = Meteor.users.find({}).fetch();

        for (i = 0; i < users.length; i++) {

            // Find all subscribers for this user
            var subscribers = Subscribers.find({ ownerId: users[i]._id }).fetch();

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

        // Get list
        list = Lists.findOne(listId);

        // Get host
        host = Meteor.absoluteUrl();

        // Style
        testEmailData.html = '<div style="font-size: 16px;">' + testEmailData.html + '</div>';

        // Add unsubscribe data
        testEmailData.html = Meteor.call('addEmailEnding', testEmailData.html, list);

        testEmailData.unique_args = {
            'testArg': 'justatest'
        };

        // Build mail
        var helper = sendgridModule.mail;
        from_email = new helper.Email(list.brandEmail);
        to_email = new helper.Email(testEmailData.to);
        subject = testEmailData.subject;
        content = new helper.Content("text/html", testEmailData.html);
        mail = new helper.Mail(from_email, subject, to_email, content);

        mail.from_email.name = list.userName;
        mail.addCustomArg({ 'subscriberId': 'someTestId' });

        // Send
        var requestBody = mail.toJSON()
        var request = sendgrid.emptyRequest()
        request.method = 'POST'
        request.path = '/v3/mail/send'
        request.body = requestBody

        if (Meteor.settings.mode != 'demo') {
            sendgrid.API(request, function(err, response) {
                if (response.statusCode != 202) {
                    console.log(response.body);
                }
            });

        }

    }
});
