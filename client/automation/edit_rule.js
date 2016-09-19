Template.editRule.rendered = function() {

  // Get data
  emailData = this.data;

  // Init editor
  var emailText = emailData.emailText;
  $('#email-text').summernote({
    height: 300
  });
  $('#email-text').summernote('code', emailText);

  // Init time
  $('#select-time').val(emailData.time);
  $('#select-period').val(emailData.period);

  // Conditions
  if (emailData.conditions) {
    conditionsIndex = emailData.conditions.length;
  }
  else {
    conditionsIndex = 0;
  }

  // Add existing conditions
  if (conditionsIndex > 0) {

    for (c = 0; c < conditionsIndex; c++) {

      // Create block
      var conditionBlock;
      conditionBlock = "<div class='row'>";
      conditionBlock += "<div class='col-md-2'>If</div>";
      conditionBlock += "<div class='col-md-3'><select id='select-criteria-" + c + "' class='form-control'></select></div>";
      conditionBlock += "<div class='col-md-3'><select id='select-parameter-" + c + "' class='form-control'></select></div>";
      conditionBlock += "</div>";

      // Append
      $('#conditions').append(conditionBlock);

      // Fill select criteria
      $('#select-criteria-' + c).append($('<option>', {
        value: "bought",
        text: "Bought"
      }));

      $('#select-criteria-' + c).append($('<option>', {
        value: "notbought",
        text: "Didn't buy"
      }));

      // Fill
      $('#select-criteria-' + c).val(emailData.conditions[c].criteria).change();

      // Fill select parameter
      var products = Products.find({listId: emailData.listId}).fetch();

      // Set options
      for (i in products) {
        $('#select-parameter-' + c).append($('<option>', {
          value: products[i].name,
          text: products[i].name
        }));
      }

      // Fill
      $('#select-parameter-' + c).val(emailData.conditions[c].parameter).change();

    }

    // Destination
    var destinationBlock;
    destinationBlock = "<div class='row'>";
    destinationBlock += "<div class='col-md-2'>then go</div>";
    destinationBlock += "<div class='col-md-6'><select id='select-destination' class='form-control'></select></div>";
    destinationBlock += "</div>";

    $('#destination').append(destinationBlock);

    // Fill destination parameter
    var sequences = Sequences.find({listId: emailData.listId}).fetch();

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

    // Fill
    $('#select-destination').val(emailData.branchDestination).change();

  }

}

Template.editRule.events({

  'click #add-condition': function () {

    // Create block
    var conditionBlock;
    conditionBlock = "<div class='row'>";
    conditionBlock += "<div class='col-md-2'>If</div>";
    conditionBlock += "<div class='col-md-3'><select id='select-criteria-"+ conditionsIndex + "' class='form-control'></select></div>";
    conditionBlock += "<div class='col-md-3'><select id='select-parameter-" + conditionsIndex + "' class='form-control'></select></div>";
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
    var products = Products.find({listId: this.listId}).fetch();

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
      destinationBlock += "<div class='col-md-2'>then go</div>";
      destinationBlock += "<div class='col-md-6'><select id='select-destination' class='form-control'></select></div>";
      destinationBlock += "</div>";

      $('#destination').append(destinationBlock);

      // Fill destination parameter
      var sequences = Sequences.find({listId: this.listId}).fetch();

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
  'click #update': function() {

    // Get elements
    var email = {
      _id: this._id,
      emailText: $('#email-text').summernote('code'),
      emailSubject: $('#email-subject').val(),
      emailName: $('#email-name').val(),
      time: $('#select-time :selected').val(),
      period: $('#select-period :selected').val()
    }

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

    // Update
    Meteor.call('updateRule', email);

  },
  'click #test-email': function () {

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
