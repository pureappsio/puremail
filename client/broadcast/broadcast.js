Template.broadcast.rendered = function() {

    // Init editor
    CKEDITOR.replace('email-text');

    // Init date picker
    var now = new Date();
    $('#day').val(now.getDate());
    $('#month').val(now.getMonth() + 1);
    $('#minute').val(now.getMinutes());
    $('#hour').val(now.getHours());

}

Template.broadcast.helpers({

    templates: function() {
        return EmailTemplates.find({});
    },

    purelink: function() {

        base = Meteor.absoluteUrl() + 'api/segment';

        if (Session.get('selectedSequence')) {
            base += '?sequence=' + Session.get('selectedSequence');
        }


        if (Session.get('selectedInterest')) {
            if (Session.get('selectedInterest') != 'none') {
                base += '&tag=' + $('#segmentation-interest :selected').val();
            }

        }

        return base;

    },
    interests: function() {
        if (Session.get('selectedList')) {
            return Interests.find({ listId: Session.get('selectedList') });
        } else {
            return Interests.find({});
        }

    },
    sequences: function() {
        if (Session.get('selectedList')) {
            return Sequences.find({ listId: Session.get('selectedList') });
        } else {
            return Sequences.find({});
        }

    }

});

Template.broadcast.events({

    'click #load-template': function() {

        // Get template
        var template = EmailTemplates.findOne($('#template-id :selected').val());

        // Load
        CKEDITOR.instances['email-text'].setData(template.text);
        $('#email-subject').val(template.subject);

    },

    'click #segmentation-sequence, change #segmentation-sequence': function() {

        Session.set('selectedSequence', $('#segmentation-sequence :selected').val());

    },
    'click #segmentation-interest, change #segmentation-interest': function() {

        Session.set('selectedInterest', $('#segmentation-interest :selected').val());

    },
    'click #send-email': function() {

        // Get email text & subject
        var emailText = CKEDITOR.instances['email-text'].getData();
        var emailSubject = $('#email-subject').val();
        var listId = $('#list :selected').val();

        // Get all filters
        index = Session.get('filterIndex');
        filters = [];

        for (i = 2; i <= index; i++) {

            filter = {
                criteria: $('#select-criteria-' + i).val(),
                option: $('#select-option-' + i + ' :selected').val()
            }

            filters.push(filter);
        }

        // Time
        var time = new Date();
        time.setDate(parseInt($('#day').val()));
        time.setMonth(parseInt($('#month').val()) - 1);
        time.setHours(parseInt($('#hour').val()));
        time.setMinutes(parseInt($('#minute').val()));

        // Save broadcast email
        var broadcast = {
            subject: emailSubject,
            text: emailText,
            listId: listId,
            time: time,
            filters: filters,
            // recipients: customers.length,
            ownerId: Meteor.user()._id,
            resent: true
        };

        // Tagging
        broadcast.tagging = $('#tagging :selected').val();

        // Resent
        if ($('#other-subject').val() != "") {
            broadcast.otherSubject = $('#other-subject').val();
            broadcast.resent = false
        }

        Meteor.call('saveBroadcast', broadcast, function(err, broadcastId) {

            $('.indicator').show();
            $('.indicator').fadeOut(2000);

            // Add emails
            Meteor.call('sendEmails', broadcastId);

        });

    },
    'click #test-email': function() {

        // Get email text & subject
        var emailText = CKEDITOR.instances['email-text'].getData();
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
        Meteor.call('sendTestEmail', listId, testEmailData, 'test');

    }

});
