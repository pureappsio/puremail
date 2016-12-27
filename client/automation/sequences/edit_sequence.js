Template.editSequence.helpers({

  interests: function() {
    return Interests.find({listId: this.listId});
  }

});

Template.editSequence.events({

  'change #end-criteria': function() {

    // Get selection
    var criteria = $('#end-criteria :selected').val();

    // Clear
    $('#end-parameter').find('option').remove().end();

    // Set options accordingly
    if (criteria == 'interested') {

      // Fill
      var interests = Interests.find({listId: listId}).fetch();

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

  },

  'click #add-type-destination': function () {

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

    $('#end-parameter-' + destinationIndex).append($('<option>', {
        value: 'new',
        text: 'new subscribers'
      }));

    $('#end-parameter-' + destinationIndex).append($('<option>', {
      value: 'returning',
      text: 'returning subscribers'
    }));

    // Get sequences
    var sequences = Sequences.find({listId: this.listId}).fetch();

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

  'click #add-destination': function () {

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
    var interests = Interests.find({listId: this.listId}).fetch();

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
    var sequences = Sequences.find({listId: this.listId}).fetch();

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
      trigger: $('#sequence-trigger :selected').val(),
      origin: $('#origin-parameter :selected').val(),
      interest: $('#interest-parameter :selected').val(),
      listId: $('#sequence-list :selected').val(),
      ownerId: Meteor.user()._id,
      _id: this._id
    }

    // Get destination(s)
    destination = {
      action: $('#end-action :selected').val(),
      destination: $('#end-destination :selected').val(),
      criteria: $('#end-criteria :selected').val(),
      parameter:  $('#end-parameter :selected').val()
    }

    if (destinationIndex == 1) {
      sequence.destination = destination;
    }
    else {

      destinations = [];
      destinations.push(destination);

      for (i = 1; i < destinationIndex; i++) {

        destinationElement = {
          action: $('#end-action-' + i + ' :selected').val(),
          destination: $('#end-destination-' + i + ' :selected').val(),
          criteria: $('#end-criteria-' + i + ' :selected').val(),
          parameter:  $('#end-parameter-' + i + ' :selected').val()
        }
        destinations.push(destinationElement);

      }

      sequence.destination = destinations;

    }

    console.log(sequence);

    // Save sequence
    Meteor.call('updateSequence', sequence);

  }

});

Template.editSequence.rendered = function() {

  // Get lists
  var lists = Lists.find(this.data.listId).fetch();

  for (i in lists) {
    $('#sequence-list').append($('<option>', {
      value: lists[i]._id,
      text: lists[i].name
    }));
  }

  // Get sequences
  var sequences = Sequences.find({listId: this.data.listId}).fetch();

  // Remove
  $('#sequences').find('option').remove().end();

  // Add all
  for (i in sequences) {
    $('#end-destination').append($('<option>', {
      value: sequences[i]._id,
      text: sequences[i].name
    }));
  }

  // Init data
  $('#sequence-name').val(this.data.name);
  $("#sequence-list").val(this.data.listId).change();
  $("#sequence-trigger").val(this.data.trigger).change();

  $("#origin-parameter").val(this.data.origin).change();
  $("#interest-parameter").val(this.data.interest).change();

  if (this.data.thankYou) {
    $('#sequence-thank-you').val(this.data.thankYou);
  }

  if ($.isArray(this.data.destination)) {

    console.log(this.data);

    // Fill initial destination
    $("#end-action").val(this.data.destination[0].action).change();
    $("#end-destination").val(this.data.destination[0].destination).change();

    if (this.data.destination[0].criteria == 'interested') {

      // Change criteria
      $('#end-criteria').append($('<option>', {
        value: 'interested',
        text: 'interested'
      }));

      $("#end-criteria").val(this.data.destination[0].criteria).change();

      // Fill
      var interests = Interests.find({listId: listId}).fetch();

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

      $("#end-parameter").val(this.data.destination[0].parameter).change();

    }

    if (this.data.destination[0].criteria == 'are') {

      // Change criteria
      $('#end-criteria').append($('<option>', {
        value: 'are',
        text: 'are'
      }));

      $("#end-criteria").val(this.data.destination[0].criteria).change();

      // Change parameter
      $('#end-parameter').append($('<option>', {
        value: 'new',
        text: 'new subscribers'
      }));

      $('#end-parameter').append($('<option>', {
        value: 'returning',
        text: 'returning subscribers'
      }));

      $("#end-parameter").val(this.data.destination[0].parameter).change();

    }

    destinationIndex = this.data.destination.length;

    for (e = 1; e < destinationIndex; e++) {

      // Build additional element
      var element = "";

      element += "<div class='row'>";
      element += "<div class='col-md-2'></div>";

      element += "<div class='col-md-2'><select id='end-criteria-" + e + "' class='form-control'>";
      element += "</select></div>";

      element += "<div class='col-md-2'>";
      element += "<select id='end-parameter-" + e + "' class='form-control'>";
      element += "</select></div>";

      element += "<div class='col-md-2'>then</div>";

      element += "<div class='col-md-2'>";
      element += "<select id='end-action-" + e + "' class='form-control'>";
      element += "<option value='end'>end there</option>";
      element += "<option value='go'>go to sequence</option>";
      element += "</select></div>";

      element += "<div class='col-md-2'><select id='end-destination-" + e + "' class='form-control'>"
      element += "</select></div>";

      element += "</div>";

      // Append
      $('#additional-destinations').append(element);

      // Fill
      if (this.data.destination[e].criteria == 'interested') {

      // Change criteria
      $('#end-criteria-' + e).append($('<option>', {
        value: 'interested',
        text: 'interested'
      }));

      // Fill
      var interests = Interests.find({listId: listId}).fetch();

      // Remove
      $('#end-parameter-' + e).find('option').remove().end();

      // Set options
      $('#end-parameter-' + e).append($('<option>', {
        value: 'anything',
        text: 'anything'
      }));
      for (i in interests) {
        $('#end-parameter-' + e).append($('<option>', {
          value: interests[i]._id,
          text: interests[i].name
        }));
      }

    }

    if (this.data.destination[e].criteria == 'are') {

      // Change criteria
      $('#end-criteria-' + e).append($('<option>', {
        value: 'are',
        text: 'are'
      }));

      // Change parameter
      $('#end-parameter-' + e).append($('<option>', {
        value: 'new',
        text: 'new subscribers'
      }));

      $('#end-parameter-' + e).append($('<option>', {
        value: 'returning',
        text: 'returning subscribers'
      }));

    }

      // Get sequences
      var sequences = Sequences.find({listId: this.data.listId}).fetch();

      // Remove
      $('#end-destination-' + e).find('option').remove().end();

      // Add all
      for (i in sequences) {
        $('#end-destination-' + e).append($('<option>', {
          value: sequences[i]._id,
          text: sequences[i].name
        }));
      }

      $('#end-action-' + e).val(this.data.destination[e].action).change();
      $('#end-destination-' + e).val(this.data.destination[e].destination).change();

      $('#end-criteria-' + e).val(this.data.destination[e].criteria).change();
      $('#end-parameter-' + e).val(this.data.destination[e].parameter).change();

    }

  }
  else {

    destinationIndex = 1;

    // Fill initial destination
    $("#end-action").val(this.data.destination.action).change();
    $("#end-destination").val(this.data.destination.destination).change();

    // Change criteria
    $('#end-criteria').append($('<option>', {
      value: 'interested',
      text: 'are interested in'
    }));

    // Change criteria
      $('#end-criteria').append($('<option>', {
        value: 'are',
        text: 'are'
      }));

    if (this.data.destination.criteria == 'interested') {

      $("#end-criteria").val(this.data.destination.criteria).change();

      // Fill
      var interests = Interests.find({listId: listId}).fetch();

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

      $("#end-parameter").val(this.data.destination.parameter).change();

    }

    if (this.data.destination.criteria == 'are') {

      $("#end-criteria").val(this.data.destination.criteria).change();

      // Change parameter
      $('#end-parameter').append($('<option>', {
        value: 'new',
        text: 'new subscribers'
      }));

      $('#end-parameter').append($('<option>', {
        value: 'returning',
        text: 'returning subscribers'
      }));

      $("#end-parameter").val(this.data.destination.parameter).change();

    }
  }

}
