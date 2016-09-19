Meteor.methods({

  processEvents: function(events) {

    // Go through events
    for (i = 0; i < events.length; i++) {

      if (events[i].subscriberId) {

        if (Subscribers.findOne(events[i].subscriberId)) {

          // Find subscriber
          subscriber = Subscribers.findOne(events[i].subscriberId);
          console.log("New event received for subscriber: ");
          console.log(subscriber);

          // Delivered
          if (events[i].event == 'delivered') {

            // Update
            Subscribers.update(events[i].subscriberId, {$inc: {'delivered': 1}});

          }

          // Opened
          if (events[i].event == 'open') {

            // Update
            Subscribers.update(events[i].subscriberId, {$inc: {'opened': 1}});
            Subscribers.update(events[i].subscriberId, {$set: {'lastOpen': new Date()}});

          }

          // Click
          if (events[i].event == 'click') {

            // Update
            Subscribers.update(events[i].subscriberId, {$inc: {'clicked': 1}});
            Subscribers.update(events[i].subscriberId, {$set: {'lastClick': new Date()}});

          }

        }

      }

      // Broadcast status
      if (events[i].broadcastId) {

        // Exists?
        if (Broadcasts.findOne(events[i].broadcastId)) {

          // Delivered
          if (events[i].event == 'delivered') {

            // Update
            Broadcasts.update(events[i].broadcastId, {$inc: {'delivered': 1}});

          }

          // Opened
          if (events[i].event == 'open') {

            // Update
            Broadcasts.update(events[i].broadcastId, {$inc: {'opened': 1}});

          }

          // Click
          if (events[i].event == 'click') {

            // Update
            Broadcasts.update(events[i].broadcastId, {$inc: {'clicked': 1}});

          }

        }

      }

      // Rules status
      if (events[i].ruleId) {

        // Exists?
        if (Automations.findOne(events[i].ruleId)) {

          // Delivered
          if (events[i].event == 'delivered') {

            // Update
            Automations.update(events[i].ruleId, {$inc: {'delivered': 1}});

          }

          // Opened
          if (events[i].event == 'open') {

            // Update
            Automations.update(events[i].ruleId, {$inc: {'opened': 1}});

          }

          // Click
          if (events[i].event == 'click') {

            // Update
            Automations.update(events[i].ruleId, {$inc: {'clicked': 1}});

          }

        }

      }

    }

  }

});
