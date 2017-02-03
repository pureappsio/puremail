Template.filters.rendered = function() {

    // // Get lists
    // var lists = Lists.find({}).fetch();

    // // Set options
    // for (i in lists) {
    //     $('#select-option-0').append($('<option>', {
    //         value: lists[i]._id,
    //         text: lists[i].name
    //     }));
    // }

    Session.set('filterIndex', 1);
}

Template.filters.helpers({

    filteredCustomers: function() {
        return Session.get('filteredCustomers');
    },
    lists: function() {
        return Lists.find({});
    }

});

Template.filters.events({

    'change .select-criteria': function(event, template) {

        // Get ID
        var id = event.target.id;
        var index = id.slice(-1);

        // Get criteria
        var criteria = $('#' + id).val();

        console.log(criteria);

        // Get list ID
        var listId = $('#list :selected').val();

        // Clean options
        $('#select-option-' + index).find('option').remove().end();

        // Change options
        if (criteria == 'subscribed' || criteria == 'notsubscribed') {

            // Get lists
            var lists = Lists.find({}).fetch();

            // Set options
            for (i in lists) {
                $('#select-option-' + index).append($('<option>', {
                    value: lists[i]._id,
                    text: lists[i].name
                }));
            }

        }

        if (criteria == 'coming' || criteria == 'notcoming') {


            $('#select-option-' + index).append($('<option>', {
                value: 'blog',
                text: "blog"
            }));

            $('#select-option-' + index).append($('<option>', {
                value: 'landing',
                text: "ads"
            }));

            $('#select-option-' + index).append($('<option>', {
                value: 'social',
                text: "social"
            }));

        }

        if (criteria == 'opened' || criteria == 'clicked') {

            for (i = 1; i < 5; i++) {

                $('#select-option-' + index).append($('<option>', {
                    value: i,
                    text: i + " emails"
                }));
            }

        }

        if (criteria == 'bought' || criteria == 'boughtless') {

            for (i = 1; i < 5; i++) {

                $('#select-option-' + index).append($('<option>', {
                    value: i,
                    text: i + " products"
                }));
            }

        }

        if (criteria == 'boughtproduct' || criteria == 'notboughtproduct') {

            // Get products for this list
            Meteor.call('getProducts', listId, function(err, products) {

                // Set options
                for (i in products) {
                    $('#select-option-' + index).append($('<option>', {
                        value: products[i]._id,
                        text: products[i].name
                    }));
                }


            });


        }

        if (criteria == 'are') {

            $('#select-option-' + index).append($('<option>', {
                value: 'customers',
                text: "customers"
            }));

            $('#select-option-' + index).append($('<option>', {
                value: 'notcustomers',
                text: "not customers"
            }));

            $('#select-option-' + index).append($('<option>', {
                value: 'sequence',
                text: "in a sequence"
            }));

            $('#select-option-' + index).append($('<option>', {
                value: 'notsequence',
                text: "not in a sequence"
            }));

        }

        if (criteria == 'interested') {

            // Get products
            var interests = Interests.find({ listId: listId }).fetch();
            console.log(interests);

            // Set options
            for (i in interests) {
                $('#select-option-' + index).append($('<option>', {
                    value: interests[i]._id,
                    text: interests[i].name
                }));
            }

        }

        if (criteria == 'plan') {

            $('#select-option-' + index).append($('<option>', {
                value: 'yes',
                text: "yes"
            }));

            $('#select-option-' + index).append($('<option>', {
                value: 'no',
                text: "no"
            }));

        }

    },
    'click #plus-filter': function() {

        // Get filter index
        index = Session.get('filterIndex');
        index++;
        Session.set('filterIndex', index);

        newFilter = '<div class="row"><div class="col-md-3">And</div>';
        newFilter += '<div class="col-md-2"><select id="select-criteria-' + index + '" class="form-control select-criteria">';
        newFilter += "<option value='coming'>coming from</option>";
        newFilter += "<option value='notcoming'>not coming from</option>";
        newFilter += "<option value='opened'>opened at least</option>";
        newFilter += "<option value='clicked'>clicked on at least</option>";
        newFilter += "<option value='bought'>bought at least</option>";
        newFilter += "<option value='boughtless'>bought less than</option>";
        newFilter += "<option value='boughtproduct'>bought</option>";
        newFilter += "<option value='notboughtproduct'>didn't buy</option>";
        newFilter += "<option value='are'>are</option>";
        newFilter += "<option value='interested'>are interested in</option>";
        newFilter += "<option value='plan'>are in a plan</option>";
        newFilter += "</select></div>";
        newFilter += '<div class="col-md-3"><select id="select-option-' + index + '" class="form-control"></select></div></div>';

        $('#other-filters').append(newFilter);

        $('#select-option-' + index).append($('<option>', {
            value: 'blog',
            text: "blog"
        }));

        $('#select-option-' + index).append($('<option>', {
            value: 'landing',
            text: "ads"
        }));

        $('#select-option-' + index).append($('<option>', {
            value: 'social',
            text: "social"
        }));



    },
    'click #select': function() {

        // Get all filters
        index = Session.get('filterIndex');
        filters = [];

        for (i = 1; i <= index; i++) {

            if ($('#select-criteria-' + i).val()) {
                filter = {
                    criteria: $('#select-criteria-' + i).val(),
                    option: $('#select-option-' + i + ' :selected').val()
                }

                filters.push(filter);
            }

        }
        console.log(filters);

        // Filter subscribers
        listId = $('#list :selected').val();
        Meteor.call('getNumberFilteredSubscribers', listId, filters, function(err, filteredCustomers) {

            // Set session variable
            Session.set('filteredCustomers', filteredCustomers);

        });
    }

});
