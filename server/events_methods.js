Meteor.methods({

    processNotifications: function(notification) {

        // Get subject
        if (notification.subject) {

            // Print
            console.log('Notification received: ');
            try {
                var notificationData = JSON.parse(notification.subject);
            } catch (err) {
                var notificationData = notification.subject;
            }
            console.log(notificationData);

            // Get sale
            var integration = Integrations.findOne({ url: notificationData.website });
            var baseUrl = 'http://' + integration.url + '/edd-api/sales/';
            var token = integration.token;
            var key = integration.key;

            // Query
            request = baseUrl + '?key=' + key + '&token=' + token + '&id=' + notificationData.paymentId;
            res = HTTP.get(request);

            if (res.data.sales) {

                // Get sale
                var sale = res.data.sales[0];

                // Send notification
                parameters = {
                    token: Meteor.settings.pushoverToken,
                    user: Meteor.settings.pushoverUser,
                    sound: 'cashregister',
                    message: 'New sale of ' + sale.products[0].name + ' ($' + sale.total + ')'
                };
                HTTP.post('https://api.pushover.net/1/messages.json', { params: parameters });

                // Process conditional emails
                if (ConditionalEmails.findOne({ trigger: 'bought', parameter: sale.products[0].name })) {

                    // Get email
                    var email = ConditionalEmails.findOne({ listId: { $exists: true }, trigger: 'bought', parameter: sale.products[0].name });
                    var list = Lists.findOne(email.listId);

                    // Calculate date
                    var currentDate = new Date();
                    currentDate = currentDate.getTime();

                    if (email.period == 'seconds') {
                        currentDate += email.time * 1000;
                    }

                    if (email.period == 'minutes') {
                        currentDate += email.time * 1000 * 60;
                    }
                    if (email.period == 'hours') {
                        currentDate += email.time * 1000 * 60 * 60;
                    }
                    if (email.period == 'days') {
                        currentDate += email.time * 1000 * 60 * 60 * 24;
                    }

                    var entryDate = new Date(currentDate);

                    // Subscriber exists ?
                    subscriber = Subscribers.findOne({ listId: list._id, email: sale.email });
                    if (!subscriber) {

                        // Add new subscriber
                        console.log('New subscriber');
                        var subscriber = {
                            email: sale.email,
                            listId: list._id,
                            ownerId: email.ownerId,
                            last_updated: new Date()
                        }
                        Subscribers.insert(subscriber);
                    }

                    // Add email to scheduler
                    var entry = {
                        name: email.subject,
                        ownerId: email.ownerId,
                        date: entryDate,
                        to: sale.email,
                        from: list.userName + ' <' + list.brandEmail + '>',
                        subject: email.subject,
                        text: email.text,
                        listId: list._id
                    }
                    console.log(entry);
                    Scheduled.insert(entry);

                }

            }

        }

    },
    processEvents: function(events) {

        // Go through events
        for (i = 0; i < events.length; i++) {

            if (events[i].subscriberId) {

                if (Subscribers.findOne(events[i].subscriberId)) {

                    // Find subscriber
                    subscriber = Subscribers.findOne(events[i].subscriberId);
                    console.log("New event received for subscriber: ");
                    console.log(subscriber);

                    // Init stat object
                    var stat = {
                        date: new Date(),
                        subscriberId: events[i].subscriberId,
                        ownerId: subscriber.ownerId,
                        listId: subscriber.listId
                    }

                    if (subscriber.origin) {
                        stat.origin = subscriber.origin;
                    }

                    // Delivered
                    if (events[i].event == 'delivered') {

                        // Update
                        stat.event = 'delivered';

                    }

                    // Opened
                    if (events[i].event == 'open') {

                        // Update
                        stat.event = 'opened';
                        Subscribers.update(events[i].subscriberId, { $set: { 'lastOpen': new Date() } });
                        Subscribers.update(events[i].subscriberId, { $inc: { 'opened': 1 } });

                    }

                    // Click
                    if (events[i].event == 'click') {

                        // Update
                        stat.event = 'clicked';
                        Subscribers.update(events[i].subscriberId, { $set: { 'lastClick': new Date() } });
                        Subscribers.update(events[i].subscriberId, { $inc: { 'clicked': 1 } });

                    }

                    // Broadcast status
                    if (events[i].broadcastId) {

                        // Exists?
                        if (Broadcasts.findOne(events[i].broadcastId)) {

                            // Update stat
                            stat.broadcastId = events[i].broadcastId;

                        }

                    }

                    // Rules status
                    if (events[i].ruleId) {

                        // Exists?
                        if (Automations.findOne(events[i].ruleId)) {

                            // Update state
                            stat.ruleId = events[i].ruleId;

                        }

                    }

                    // Sequence status
                    if (events[i].sequenceId) {

                        // Exists?
                        if (Sequences.findOne(events[i].sequenceId)) {

                            // Update state
                            stat.sequenceId = events[i].sequenceId;

                        }

                    }

                    // Insert stat
                    console.log(stat);
                    Stats.insert(stat);

                }

            }

        }

    }

});
