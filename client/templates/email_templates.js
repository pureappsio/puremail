Template.emailTemplates.rendered = function() {

    // Init editor
    CKEDITOR.replace('email-text');

}

Template.emailTemplates.helpers({

    templates: function() {
        return EmailTemplates.find({});
    }

});

Template.emailTemplates.events({

    'click #save-email': function() {

        // Get email text & subject
        var emailText = CKEDITOR.instances['email-text'].getData();
        var emailSubject = $('#email-subject').val();
        var emailName = $('#email-name').val();

        // Save broadcast email
        var template = {
            name: emailName,
            subject: emailSubject,
            text: emailText,
            ownerId: Meteor.user()._id
        };

        Meteor.call('saveTemplate', template);

    }

});
