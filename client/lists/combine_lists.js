Template.combineLists.rendered = function() {

  // Get lists
  var lists = Lists.find({}).fetch();

  // Set options
  for (i in lists) {
    $('#list-source').append($('<option>', {
      value: lists[i]._id,
      text: lists[i].name
    }));

    $('#list-target').append($('<option>', {
      value: lists[i]._id,
      text: lists[i].name
    }));
  }

}

Template.combineLists.events({

  'click #combine': function() {

    // Get lists
    var targetList = $('#list-target').val();
    var sourceList = $('#list-source').val();

    // Combine
    Meteor.call('combineLists', sourceList, targetList);

  }

});
