Template.editRule.rendered = function() {

    // Get data
    emailData = this.data;

    // Init products
    Meteor.call('getProducts', this.data.listId, function(err, products) {

        // Set options
        for (i in products) {
            $('#offer-product').append($('<option>', {
                value: products[i]._id,
                text: products[i].name
            }));

            $('#select-parameter').append($('<option>', {
                value: products[i]._id,
                text: products[i].name
            }));
        }

        if (emailData.productId) {
            $('#offer-product').val(emailData.productId);
        }

    });

    // Fill destination parameter
    var sequences = Sequences.find({ listId: this.data.listId }).fetch();

    // Set options
    for (i in sequences) {
        $('#select-destination').append($('<option>', {
            value: sequences[i]._id,
            text: sequences[i].name
        }));
    }

    $('#select-destination').append($('<option>', {
        value: 'end',
        text: 'Stop Here'
    }));

    // Init editor
    var emailText = emailData.emailText;

    CKEDITOR.replace('email-text');
    CKEDITOR.instances['email-text'].setData(emailText);

    // Init time
    $('#select-time').val(emailData.time);
    $('#select-period').val(emailData.period);

    // Init offer
    if (emailData.useOffer) {
        if (emailData.useOffer == true) {
            $('#use-offer').val("yes");
        } else {
            $('#use-offer').val("no");
        }

        $('#offer-delay').val(emailData.expiryDate);
        $('#offer-discount').val(emailData.offerDiscount);

    }

}

Template.editRule.helpers({

    // offers: function() {
    //     return Offers.find({ emailId: this._id });
    // },
    conditions: function() {
        return Conditions.find({ emailId: this._id });
    }

});

Template.editRule.events({

    'click #add-condition': function() {

        var condition = {
            destination: $('#select-destination :selected').val(),
            criteria: $('#select-criteria :selected').val(),
            parameter: $('#select-parameter :selected').val(),
            sequenceId: this.sequenceId,
            ownerId: Meteor.user()._id,
            listId: this.listId,
            emailId: this._id
        }

        Meteor.call('addCondition', condition);

    },
    'click #update': function() {

        // Get elements
        var email = {
            _id: this._id,
            emailText: CKEDITOR.instances['email-text'].getData(),
            emailSubject: $('#email-subject').val(),
            emailName: $('#email-name').val(),
            time: $('#select-time :selected').val(),
            period: $('#select-period :selected').val()
        }

        // Offer
        if ($('#use-offer :selected').val() == 'yes') {
            email.useOffer = true;
            email.productId = $('#offer-product :selected').val();
            email.expiryDate = $('#offer-delay :selected').val();
            email.offerDiscount = $('#offer-discount :selected').val();
        } else {
            email.useOffer = false;
        }

        // Update
        Meteor.call('updateRule', email);

    },
    'click #test-email': function() {

        // Get email text & subject
        var emailText = $('#email-text').summernote('code');
        var emailSubject = $('#email-subject').val();
        var to = $('#test-to').val();

        // Format email data
        var emailData = {
            subject: emailSubject,
            html: emailText,
            to: to
        };

        Meteor.call('sendTestEmail', this.listId, emailData);
    }

});
