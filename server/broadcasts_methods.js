Meteor.methods({

  sendEmails: function(broadcastId) {

    var startTime = new Date();

    // Get broadcast
    broadcast = Broadcasts.findOne(broadcastId);

    // Get list
    list = Lists.findOne(broadcast.listId);
    from = list.userName + ' <' + list.brandEmail +'>';

    console.log('Sending broadcast email from: ' + from);

    // // Filter
    // recipients = Meteor.call('filterSubscribers', broadcast.listId, broadcast.filters);

    // // Go through people
    // var entries = [];
    // for (i = 0; i < recipients.length; i++) {

    //   // Create new entry
    //   var entry = {
    //     name: list.userName,
    //     ownerId: Meteor.user()._id,
    //     listId: broadcast.listId,
    //     date: broadcast.time,
    //     to: recipients[i].email,
    //     from: list.userName + ' <' + list.brandEmail +'>',
    //     subject: broadcast.subject,
    //     text: broadcast.text,
    //     type: 'broadcast',
    //     broadcastId: broadcastId
    //   }

    //   // Add to array
    //   entries.push(entry);

    // }

    // Push array in Scheduled
    // Scheduled.batchInsert(entries);

    // var endTime = new Date();
    // console.log('Time to add emails to scheduler: ' + (endTime.getTime() - startTime.getTime() ) + ' ms' );

    // Make entry
    entry = {

      name: list.userName,
      ownerId: Meteor.user()._id,
      listId: broadcast.listId,
      date: broadcast.time,
      from: list.userName + ' <' + list.brandEmail +'>',
      subject: broadcast.subject,
      filters: broadcast.filters,
      text: broadcast.text,
      type: 'broadcast',
      broadcastId: broadcastId,
      recipients: broadcast.recipients
    };
    Scheduled.insert(entry);

  },
  saveBroadcast: function(broadcast) {

    // Get number of recipients
    var recipients = Meteor.call('filterSubscribers', broadcast.listId, broadcast.filters);
    broadcast.recipients = recipients.length;
    console.log(broadcast);

    // Insert
    var broadcastId = Broadcasts.insert(broadcast);
    return broadcastId;

  },
  deleteBroadcast: function(broadcastId) {

    // Delete
    Broadcasts.remove(broadcastId);

  },
  getNumberFilteredSubscribers: function(listId, filters) {

    var filteredSubscribers = Meteor.call('filterSubscribers', listId, filters);
    return filteredSubscribers.length;

  },
  filterSubscribers: function(listId, filters) {

    // Get all subscribers
   	var subscribers = Subscribers.find({listId: listId}).fetch();

   	// Filter
   	var filteredCustomers = [];

   	for (i = 0; i < subscribers.length; i++) {

      currentSubscriber = subscribers[i];
      addSubscriberArray = [];

      for (f = 0; f < filters.length; f++) {

        criteria = filters[f].criteria;
        option = filters[f].option;

        if (criteria == 'subscribed') {

          addSubscriberArray[f] = false;

            if (currentSubscriber.listId == option) {
              addSubscriberArray[f] = true;
            }

        }

      if (criteria == 'notsubscribed'){

        addSubscriberArray[f] = true;

        if (currentSubscriber.listId == option) {
          addSubscriberArray[f] = false;
        }

      }

      if (criteria == 'opened') {

        addSubscriberArray[f] = false;

          if (currentSubscriber.opened >= option) {
            addSubscriberArray[f] = true;
          }

      }

      if (criteria == 'clicked') {

        addSubscriberArray[f] = false;

          if (currentSubscriber.clicked >= option) {
            addSubscriberArray[f] = true;
          }

      }

      if (criteria == 'coming') {

        addSubscriberArray[f] = false;

          if (currentSubscriber.origin == option) {
            addSubscriberArray[f] = true;
          }

      }

      if (criteria == 'notcoming') {

        addSubscriberArray[f] = true;

          if (currentSubscriber.origin == option) {
            addSubscriberArray[f] = false;
          }

      }

      if (criteria == 'bought') {

        addSubscriberArray[f] = false;

          if (currentSubscriber.nb_products >= option) {
            addSubscriberArray[f] = true;
          }

      }

      if (criteria == 'boughtless') {

        addSubscriberArray[f] = false;

          if (currentSubscriber.nb_products <= option || !currentSubscriber.nb_products) {
            addSubscriberArray[f] = true;
          }

      }

      if (criteria == 'boughtproduct') {

        addSubscriberArray[f] = false;

          if (currentSubscriber.products) {
            for (j = 0; j < currentSubscriber.products.length; j++) {
              if (currentSubscriber.products[j].name == option) {
                addSubscriberArray[f] = true;
              }
            }
          }
      }

      if (criteria == 'notboughtproduct') {

        addSubscriberArray[f] = true;

          if (currentSubscriber.products) {
            for (j = 0; j < currentSubscriber.products.length; j++) {
              if (currentSubscriber.products[j].name == option) {
                addSubscriberArray[f] = false;
              }
            }
          }
      }

      if (criteria == 'are') {

        addSubscriberArray[f] = false;

        if (option == 'customers' && currentSubscriber.nb_products >= 1) {
          addSubscriberArray[f] = true;
        }

        if (option == 'notcustomers') {
          if (currentSubscriber.nb_products == 0 || !currentSubscriber.nb_products) {
            addSubscriberArray[f] = true
          }
        }

        if (option == 'sequence' && currentSubscriber.sequenceId != null) {
          addSubscriberArray[f] = true;
        }

        if (option == 'notsequence') {
          if (currentSubscriber.sequenceId == null || !currentSubscriber.sequenceId) {
            addSubscriberArray[f] = true
          }
        }

      }

      if (criteria == 'interested') {

        addSubscriberArray[f] = false;
        if (currentSubscriber.interests) {
          for (j = 0; j < currentSubscriber.interests.length; j++) {
            if (currentSubscriber.interests[j]._id == option) {
              addSubscriberArray[f] = true;
            }
          }
        }

      }

      }

      addSubscriber = true;
      for (c = 0; c < addSubscriberArray.length; c++) {
        addSubscriber = addSubscriber * addSubscriberArray[c];
      }

      if (addSubscriber) {
        filteredCustomers.push(currentSubscriber);
      }

    }

    return filteredCustomers;

  }

});
