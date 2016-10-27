Template.editConditionalEmail.rendered = function() {

  // Get data
  emailData = this.data;

  // Init editor
  var emailText = emailData.text;
  $('#email-text').summernote({
    height: 300
  });
  $('#email-text').summernote('code', emailText);

  // Init time
  $('#select-time').val(emailData.time);
  $('#select-period').val(emailData.period);

}

Template.editConditionalEmail.events({

  'click #update': function() {

    // Get elements
    var email = {
      _id: this._id,
      text: $('#email-text').summernote('code'),
      subject: $('#email-subject').val(),
      time: $('#select-time :selected').val(),
      period: $('#select-period :selected').val()
    }

    // Update
    Meteor.call('updateConditionalEmail', email);
  }

});