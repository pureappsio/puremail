Template.addToSequence.rendered = function() {

  // Get list
  listId = $('#select-option-0 :selected').val();

  // Get sequences
  var sequences = Sequences.find({listId: listId}).fetch();

  // Remove
  $('#sequences').find('option').remove().end();

  // Add all
  for (i in sequences) {
    $('#sequences').append($('<option>', {
      value: sequences[i]._id,
      text: sequences[i].name
    }));
  }

};

Template.addToSequence.events({

  'change #select-option-0': function() {

    // Get list
    listId = $('#select-option-0 :selected').val();

    // Get sequences
    var sequences = Sequences.find({listId: listId}).fetch();

    // Remove
    $('#sequences').find('option').remove().end();

    // Add all
    for (i in sequences) {
      $('#sequences').append($('<option>', {
        value: sequences[i]._id,
        text: sequences[i].name
      }));
    }

  },
  'click #add-to-sequence': function() {

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

    // Get sequence
    var sequenceId = $('#sequences :selected').val();

    // Assign
    Meteor.call('assignSequence', filters, sequenceId);

  }

});
