Meteor.methods({

  generateEmails: function() {

    for (i = 0; i < 100; i++) {

      var subscriber = {
        email: Math.random().toString(36).slice(-5) + '.' + Math.random().toString(36).slice(-5) + '@gmail.com',
        listId: 'gMu8B7Dv83P8kviH7',
        ownerId: Meteor.user()._id,
        origin: 'blog',
        last_updated: new Date(),
        date_added: new Date()
      }

      Subscribers.insert(subscriber);

    }

  }

});
