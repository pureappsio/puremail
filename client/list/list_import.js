Template.listImport.rendered = function() {

  Session.set('selectedInterests', []);
  Session.set('selectedOrigins', []);

}

Template.listImport.helpers({

  interests: function() {
    return Interests.find({listId: this._id});
  }

});

Template.listImport.events({

  "change #files": function (e) {
    var listId = this._id;
    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0, file; file = files[i]; i++) {
      console.log(i);
      if (file.type.indexOf("text") == 0) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          var text = e.target.result;
          //console.log(text);
          var all = $.csv.toArray(text);
          //console.log(all);
          Meteor.call('insertEmailList', all, Session.get('selectedInterests'), listId, Meteor.user());
        }
        reader.readAsText(file);
      }
    }
  },
  'change .interest': function() {

    // Selected interests
    var selectedInterests = [];

    // Interests
    var interests = Interests.find({}).fetch();

    // Get value of all category filters
    for (i = 0; i < interests.length; i++) {
      if ($("#" + interests[i]._id).is(':checked')) {
        selectedInterests.push(interests[i].name);
      }
    }

    // Set
    Session.set('selectedInterests', selectedInterests);
  },

  'change .origin': function() {

    // Selected interests
    var selectedOrigins = [];

    // Get values
    if ($("#blog").is(':checked')) {
      selectedOrigins.push('blog');
    }

    if ($("#amazon").is(':checked')) {
      selectedOrigins.push('amazon');
    }

    // Set
    Session.set('selectedOrigins', selectedOrigins);
  }
});
