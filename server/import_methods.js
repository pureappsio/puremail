Meteor.methods({

  insertEmailList: function(list, listInterests, listId, user) {

    // Build interests
    var interests = [];
    for (k = 0; k < listInterests.length; k++) {
      var interest = Interests.findOne({name: listInterests[k], ownerId: user._id});
      interests.push(interest);
    }

    // Add all
    for(i = 0; i < list.length; i++) {

      // Get email
      var email = list[i];
      // if (email[email.length-1] == '"') {
      //   email = email.substring(0, email.length-1);
      // }
      //
      email = email.split('"')[0];

      if (email != '') {

        // Is customer?
        criterias = {email: email, listId: listId, ownerId: user._id};
        var subscriberExist = Subscribers.find(criterias).fetch();
        if (subscriberExist.length == 0) {

          // Generate subscriber
          var emailElement = {
            interests: interests,
            email: email,
            ownerId: user._id,
            listId: listId,
            confirmed: true,
            origin: 'blog',
            date_added: new Date(),
            last_updated: new Date()
          };

          // Insert
          Subscribers.insert(emailElement);
          console.log('Adding new subscriber with email: ' + email);

        }
        else {

          // Update
          Subscribers.update(criterias, {$set: {"last_updated": new Date()}});
          Subscribers.update(criterias, {$set: {"origin": 'blog'}});
          Subscribers.update(criterias, {$set: {"confirmed": true}});

          // Update interests
          var subscriber = Subscribers.findOne(criterias);
          subscriber = Meteor.call('updateSubscriberInterests', subscriber, interests);

          Subscribers.update(criterias, {$set: {"interests": subscriber.interests}});

          console.log('Updating subscriber with email: ' + email);
        }
      }

    }

  }

});
