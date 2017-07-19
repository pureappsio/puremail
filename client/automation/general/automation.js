Template.automation.events({

    'change #end-criteria': function() {

        // Get selection
        var criteria = $('#end-criteria :selected').val();

        // Clear
        $('#end-parameter').find('option').remove().end();

        // Set options accordingly
        if (criteria == 'interested') {

            // Fill
            var interests = Interests.find({ listId: listId }).fetch();

            // Set options
            $('#end-parameter').append($('<option>', {
                value: 'anything',
                text: 'anything'
            }));
            for (i in interests) {
                $('#end-parameter').append($('<option>', {
                    value: interests[i]._id,
                    text: interests[i].name
                }));
            }

        }
        if (criteria == 'are') {

            $('#end-parameter').append($('<option>', {
                value: 'new',
                text: 'new subscribers'
            }));

            $('#end-parameter').append($('<option>', {
                value: 'returning',
                text: 'returning subscribers'
            }));

        }

        if (criteria == 'origin') {

            $('#end-parameter').append($('<option>', {
                value: 'blog',
                text: 'blog'
            }));

            $('#end-parameter').append($('<option>', {
                value: 'landing',
                text: 'landing page'
            }));

        }

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

        // Send
        Meteor.call('sendTestEmail', this._id, emailData);
    },

    'click #select-criteria, change #select-criteria': function() {

        // Get selection
        var criteria = $('#select-criteria :selected').val();

        // Get lists
        if (this._id) {
            var lists = Lists.find(this._id).fetch();
        } else {
            var lists = Lists.find({}).fetch();
        }

        // Clean
        $('#select-parameter').find('option').remove().end();

        // Decide
        // if (criteria == 'bought') {
        //   $('#select-parameter').append($('<option>', {
        //     value: "any",
        //     text: "any product"
        //   }));
        // }

        if (criteria == 'subscribed') {
            for (i in lists) {
                $('#select-parameter').append($('<option>', {
                    value: lists[i]._id,
                    text: lists[i].name
                }));
            }
        }
    },
    'click #add-type-destination': function() {

        // Build additional element
        var element = "";

        element += "<div class='row'>";
        element += "<div class='col-md-2'></div>";

        element += "<div class='col-md-2'><select id='end-criteria-" + destinationIndex + "' class='form-control'>";
        element += "<option value='are'>are</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'>";
        element += "<select id='end-parameter-" + destinationIndex + "' class='form-control'>";
        element += "</select></div>";

        element += "<div class='col-md-2'>then</div>";

        element += "<div class='col-md-2'>";
        element += "<select id='end-action-" + destinationIndex + "' class='form-control'>";
        element += "<option value='end'>end there</option>";
        element += "<option value='go'>go to sequence</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'><select id='end-destination-" + destinationIndex + "' class='form-control'>"
        element += "</select></div>";

        element += "</div>";

        // Append
        $('#additional-destinations').append(element);

        // Fill
        var interests = Interests.find({ listId: this._id }).fetch();

        $('#end-parameter-' + destinationIndex).append($('<option>', {
            value: 'new',
            text: 'new subscribers'
        }));

        $('#end-parameter-' + destinationIndex).append($('<option>', {
            value: 'returning',
            text: 'returning subscribers'
        }));

        // Get sequences
        var sequences = Sequences.find({ listId: this._id }).fetch();

        // Remove
        $('#end-destination-' + destinationIndex).find('option').remove().end();

        // Add all
        for (i in sequences) {
            $('#end-destination-' + destinationIndex).append($('<option>', {
                value: sequences[i]._id,
                text: sequences[i].name
            }));
        }

        // Increase index
        destinationIndex++

    },
    'click #add-destination': function() {

        // Build additional element
        var element = "";

        element += "<div class='row'>";
        element += "<div class='col-md-2'></div>";

        element += "<div class='col-md-2'><select id='end-criteria-" + destinationIndex + "' class='form-control'>";
        element += "<option value='interested'>are interested in</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'>";
        element += "<select id='end-parameter-" + destinationIndex + "' class='form-control'>";
        element += "<option value='anything'>anything</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'>then</div>";

        element += "<div class='col-md-2'>";
        element += "<select id='end-action-" + destinationIndex + "' class='form-control'>";
        element += "<option value='end'>end there</option>";
        element += "<option value='go'>go to sequence</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'><select id='end-destination-" + destinationIndex + "' class='form-control'>"
        element += "</select></div>";

        element += "</div>";

        // Append
        $('#additional-destinations').append(element);

        // Fill
        var interests = Interests.find({ listId: this._id }).fetch();

        // Remove
        $('#end-parameter-' + destinationIndex).find('option').remove().end();

        // Set options
        $('#end-parameter-' + destinationIndex).append($('<option>', {
            value: 'anything',
            text: 'anything'
        }));
        for (i in interests) {
            $('#end-parameter-' + destinationIndex).append($('<option>', {
                value: interests[i]._id,
                text: interests[i].name
            }));
        }

        // Get sequences
        var sequences = Sequences.find({ listId: this._id }).fetch();

        // Remove
        $('#end-destination-' + destinationIndex).find('option').remove().end();

        // Add all
        for (i in sequences) {
            $('#end-destination-' + destinationIndex).append($('<option>', {
                value: sequences[i]._id,
                text: sequences[i].name
            }));
        }

        // Increase index
        destinationIndex++

    },
    'click #add-origin-destination': function() {

        // Build additional element
        var element = "";

        element += "<div class='row'>";
        element += "<div class='col-md-2'></div>";

        element += "<div class='col-md-2'><select id='end-criteria-" + destinationIndex + "' class='form-control'>";
        element += "<option value='origin'>coming from</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'>";
        element += "<select id='end-parameter-" + destinationIndex + "' class='form-control'>";
        element += "</select></div>";

        element += "<div class='col-md-2'>then</div>";

        element += "<div class='col-md-2'>";
        element += "<select id='end-action-" + destinationIndex + "' class='form-control'>";
        element += "<option value='end'>end there</option>";
        element += "<option value='go'>go to sequence</option>";
        element += "</select></div>";

        element += "<div class='col-md-2'><select id='end-destination-" + destinationIndex + "' class='form-control'>"
        element += "</select></div>";

        element += "</div>";

        // Append
        $('#additional-destinations').append(element);

        // Remove
        $('#end-parameter-' + destinationIndex).find('option').remove().end();

        // Set options
        $('#end-parameter-' + destinationIndex).append($('<option>', {
            value: 'blog',
            text: 'blog'
        }));

        $('#end-parameter-' + destinationIndex).append($('<option>', {
            value: 'landing',
            text: 'landing page'
        }));

        // Get sequences
        var sequences = Sequences.find({ listId: this._id }).fetch();

        // Remove
        $('#end-destination-' + destinationIndex).find('option').remove().end();

        // Add all
        for (i in sequences) {
            $('#end-destination-' + destinationIndex).append($('<option>', {
                value: sequences[i]._id,
                text: sequences[i].name
            }));
        }

        // Increase index
        destinationIndex++

    },
    'click #save-sequence': function() {

        // Get sequence data
        var sequence = {
            name: $('#sequence-name').val(),
            thankYou: $('#sequence-thank-you').val(),
            type: $('#sequence-type :selected').val(),
            // trigger: $('#sequence-trigger :selected').val(),
            // origin: $('#origin-parameter :selected').val(),
            // interest: $('#interest-parameter :selected').val(),
            listId: this._id,
            ownerId: Meteor.user()._id
        }

        // Get destination(s)
        destination = {
            action: $('#end-action :selected').val(),
            destination: $('#end-destination :selected').val(),
            criteria: $('#end-criteria :selected').val(),
            parameter: $('#end-parameter :selected').val()
        }

        if (destinationIndex == 1) {
            sequence.destination = destination;
        } else {

            destinations = [];
            destinations.push(destination);

            for (i = 1; i < destinationIndex; i++) {

                destinationElement = {
                    action: $('#end-action-' + i + ' :selected').val(),
                    destination: $('#end-destination-' + i + ' :selected').val(),
                    criteria: $('#end-criteria-' + i + ' :selected').val(),
                    parameter: $('#end-parameter-' + i + ' :selected').val()
                }
                destinations.push(destinationElement);

            }

            sequence.destination = destinations;

        }

        console.log(sequence);

        // Save sequence
        Meteor.call('saveSequence', sequence);

    },
    'click #save-email': function() {

        // Get sequence data
        var email = {
            subject: $('#email-subject').val(),
            text: $('#email-text').summernote('code'),
            trigger: $('#email-trigger :selected').val(),
            parameter: $('#email-parameter :selected').val(),
            time: $('#select-time :selected').val(),
            period: $('#select-period :selected').val(),
            listId: this._id,
            ownerId: Meteor.user()._id
        };

        // Save
        Meteor.call('saveConditionalEmail', email);
    }

});

Template.automation.helpers({

    getRules: function() {
        if (this._id) {
            return Automations.find({ listId: this._id }, { sort: { 'sequenceId': 1 } });
        } else {
            return Automations.find({});
        }
    },
    interests: function() {
        return Interests.find({ listId: this._id });
    },
    sequences: function() {
        if (this._id) {
            return Sequences.find({ listId: this._id });
        } else {
            return Sequences.find({});
        }
    },
    conditionalEmails: function() {
        return ConditionalEmails.find({ listId: this._id });
    }

});

Template.automation.rendered = function() {

    // Index
    destinationIndex = 1;

    // Get lists
    if (this.data) {
        var lists = Lists.find(this.data._id).fetch();
    } else {
        var lists = Lists.find({}).fetch();
    }

    for (i in lists) {
        $('#sequence-list').append($('<option>', {
            value: lists[i]._id,
            text: lists[i].name
        }));
    }

    // Get sequences
    if (this.data) {
        listId = this.data._id;
        Tracker.autorun(function() {

            // Get products
            var products = Products.find({ listId: listId }).fetch();

            // Remove
            $('#email-parameter').find('option').remove().end();

            // Set options
            for (i in products) {
                $('#email-parameter').append($('<option>', {
                    value: products[i].name,
                    text: products[i].name
                }));
            }

            // Fill
            var interests = Interests.find({ listId: listId }).fetch();

            // Remove
            $('#end-parameter').find('option').remove().end();

            // Set options
            $('#end-parameter').append($('<option>', {
                value: 'anything',
                text: 'anything'
            }));
            for (i in interests) {
                $('#end-parameter').append($('<option>', {
                    value: interests[i]._id,
                    text: interests[i].name
                }));
            }

            // Get sequences
            var sequences = Sequences.find({ listId: listId }).fetch();

            // Remove
            $('#end-destination').find('option').remove().end();

            // Add all
            for (i in sequences) {
                $('#end-destination').append($('<option>', {
                    value: sequences[i]._id,
                    text: sequences[i].name
                }));
            }
        });
    } else {
        var sequences = Sequences.find({}).fetch();

        for (i in sequences) {
            $('#end-destination').append($('<option>', {
                value: sequences[i]._id,
                text: sequences[i].name
            }));
        }
    }

    // Init editor
    // $('#email-text').summernote({
    //     height: 300 // set editor height
    // });

}
