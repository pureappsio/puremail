Meteor.methods({

  getListSubscribers: function(listId) {

    return Subscribers.find({listId: listId}).fetch();

  }

});
