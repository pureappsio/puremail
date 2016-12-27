Template.editSequenceEmails.helpers({

    getRules: function() {
        return Automations.find({ sequenceId: this._id }, { sort: { order: 1 } });
    }

});

Template.editSequenceEmails.rendered = function() {

    // Init editor
    $('#email-text').summernote({
        height: 300 // set editor height
    });

    // Conditions
    conditionsIndex = 0;

}

Template.editSequenceEmails.events({

    'click #add-condition': function() {

        // Create block
        var conditionBlock;
        conditionBlock = "<div class='row'>";
        conditionBlock += "<div class='col-md-2'></div>";
        conditionBlock += "<div class='col-md-2'>If</div>";
        conditionBlock += "<div class='col-md-3'><select id='select-criteria-" + conditionsIndex + "' class='form-control'></select></div>";
        conditionBlock += "<div class='col-md-3'><select id='select-parameter-" + conditionsIndex + "' class='form-control'></select></div>";
        conditionBlock += "<div class='col-md-2'></div>";
        conditionBlock += "</div>";

        // Append
        $('#conditions').append(conditionBlock);

        // Fill select criteria
        $('#select-criteria-' + conditionsIndex).append($('<option>', {
            value: "bought",
            text: "Bought"
        }));

        $('#select-criteria-' + conditionsIndex).append($('<option>', {
            value: "notbought",
            text: "Didn't buy"
        }));

        // Fill select parameter
        var products = Products.find({ listId: this.listId }).fetch();

        // Set options
        for (i in products) {
            $('#select-parameter-' + conditionsIndex).append($('<option>', {
                value: products[i].name,
                text: products[i].name
            }));
        }

        // Destination block
        if (conditionsIndex == 0) {

            var destinationBlock;
            destinationBlock = "<div class='row'>";
            destinationBlock += "<div class='col-md-2'></div>";
            destinationBlock += "<div class='col-md-2'>then go</div>";
            destinationBlock += "<div class='col-md-6'><select id='select-destination' class='form-control'></select></div>";
            destinationBlock += "<div class='col-md-2'></div>";
            destinationBlock += "</div>";

            $('#destination').append(destinationBlock);

            // Fill destination parameter
            var sequences = Sequences.find({ listId: this.listId }).fetch();

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

        }

        // Increase counter
        conditionsIndex++;

    },
    'click #save-email': function() {

        // Get order
        var emails = Automations.find({ sequenceId: this._id }).fetch();

        if (emails.length > 0) {
            order = 0;
            for (i = 0; i < emails.length; i++) {
                if (emails[i].order > order) {
                    order = emails[i].order;
                }
            }
            order++;
        } else {
            order = 1;
        }

        // Get sequence data
        var email = {
            emailName: $('#email-name').val(),
            emailSubject: $('#email-subject').val(),
            emailText: $('#email-text').summernote('code'),
            time: $('#select-time :selected').val(),
            period: $('#select-period :selected').val(),
            sequenceId: this._id,
            ownerId: Meteor.user()._id,
            order: order,
            listId: this.listId
        };

        // Conditions ?
        if (conditionsIndex > 0) {
            conditions = [];
            for (j = 0; j < conditionsIndex; j++) {
                condition = {
                    criteria: $('#select-criteria-' + j + ' :selected').val(),
                    parameter: $('#select-parameter-' + j + ' :selected').val()
                }
                conditions.push(condition);
            }
            email.branchDestination = $('#select-destination :selected').val();
            email.conditions = conditions;
        }

        // Save rule
        console.log(email);
        Meteor.call('saveRule', email);

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
