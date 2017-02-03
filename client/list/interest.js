Template.interest.helpers({

  printInterest: function() {
    return (Interests.findOne(this).name).toUpperCase();
  }

});
